import React from "react";
import { Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import Storage from "@aws-amplify/storage";
import { withAuthenticator } from '@aws-amplify/ui-react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import LinkIcon from '@material-ui/icons/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import StorageIcon from '@material-ui/icons/Storage';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputBase from '@material-ui/core/InputBase';

import { Auth, API, graphqlOperation } from 'aws-amplify';
import { createObject, updateObject, deleteObject } from '../graphql/mutations';
import { listObjectByUser, getObject } from '../graphql/queries';
import { onCreateObject, onDeleteObject  } from '../graphql/subscriptions';

import {CopyToClipboard} from 'react-copy-to-clipboard';

import { browserHistory } from 'react-router'


const useStyles = theme => ({
  appBar: {
    position: 'relative'
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  appBarTitle: {
    textDecoration: 'none',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
  },
  sectionHeader: {
    padding: theme.spacing(2),
  },
  textField: {
    
  },
  wrapperButtonLoading: {
    position: 'relative',
  },
  buttonProgress: {
    color: '#fff',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  actionButtons: {
    '& > *': {
      marginLeft: theme.spacing(2),
    },
  }
});


export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
  return a;
}


class ManageFiles extends React.Component {
    
  constructor(props) {
  	super(props);
  	this.state = {
  	  myFile: "",
  	  myFileName: "",
  	  response: "",
  	  username: "",
  	  objects: [],
  	  openAlert: false,
  	  messageInfo: "",
  	  severityInfo: "error",
  	  isUploading: false,
  	  open: false,
  	  presignedUrl: "",
  	  keyObject: "",
  	  expires: 900,
  	  nextToken: null
  	};
  }
  
  handleLogout = async event => {
		await Auth.signOut();
		window.location.reload();
	};
  
  async componentDidMount() {
    const data = await Auth.currentAuthenticatedUser();
    this.setState({ username: data.username });
    this.loadObjects();
    this.createObjectListener = API.graphql(graphqlOperation(onCreateObject, { username: data.username } )).subscribe({ 
      next:  objectData => {
        console.log(objectData);
        const newObject = objectData.value.data.onCreateObject;
        const prevObjects= this.state.objects.filter(
          object => object.id !== newObject.id
          );
        const updatedObjects = [newObject, ...prevObjects];
        this.setState({ objects: updatedObjects });
      }
    });
    
    this.deleteObjectListener = API.graphql(graphqlOperation(onDeleteObject, { username: data.username } )).subscribe({
      next: objectData => {
        const deletedObject = objectData.value.data.onDeleteObject;
        const updatedObjects = this.state.objects.filter(object => object.id !== deletedObject.id);
        this.setState({ objects: updatedObjects});
      }
    });
  }
  
  async loadObjects() {
    const result = await API.graphql(graphqlOperation(listObjectByUser, { username: this.state.username, sortDirection:'ASC', limit:100, nextToken: this.state.nextToken }));
    console.log(result);
    this.setState({ objects: [...this.state.objects, ...result.data.listObjectByUser.items], nextToken: result.data.listObjectByUser.nextToken });
  }
  
  componentWillUnmount() {
    console.log("Removed.....");
    this.createObjectListener.unsubscribe();
    this.deleteObjectListener.unsubscribe();
  }
  
  uploadFile = async () => {
    if (!this.state.isUploading){
      this.setState({ isUploading: true });
      const data = await Auth.currentAuthenticatedUser();
      const key_object = `${data.username}/${this.upload.files[0].name}`;
      let result_get = await API.graphql(graphqlOperation( getObject, { id: key_object  } ));
      Storage.put(`${data.username}/${this.upload.files[0].name}`,
                  this.upload.files[0],
                  { contentType: this.upload.files[0].type, level: 'protected' })
        .then(result => {
          this.upload = null;
          console.log(result);
          this.setState({ response: "Success uploading file!" });
          if (result_get.data.getObject==null){
            const input = {
              id: result.key,
              key_object: result.key,
              username: data.username
            };
            console.log(input);
            API.graphql(graphqlOperation(createObject, { input } ));
          }
          this.setState({ openAlert: true, severityInfo: "success", messageInfo: "Success uploading file!", myFile: "", myFileName: "", isUploading: false });
        })
        .catch(err => {
          this.setState({ response: `Cannot uploading file: ${err}` });
          this.setState({ openAlert: true, severityInfo: "error", messageInfo: `Cannot uploading file: ${err}`, myFile: "", myFileName: "", isUploading: false  });
        });
    }

      
  };
  
  handleClickMore = () => {
    this.loadObjects();
  }
  
  handleDeleteObject = async objectId => {
    console.log(objectId);
    Storage.remove(objectId, { level: 'protected' })
    .then(result => { 
        console.log(result);
        const input = { id: objectId };
        API.graphql(graphqlOperation(deleteObject, { input }));
        this.setState({ openAlert: true, severityInfo: "success", messageInfo: `File ${objectId.replace(this.state.username+"/", "")}  was removed!` });
      }
    ).catch(err => { 
        console.log(err);
        this.setState({ openAlert: true, severityInfo: "error", messageInfo: `Error removing file: ${err}` });
      }
    );
  }
  
  handleDownloadObject = async keyObject => {
    Storage.get(keyObject,{ level: 'protected', download: true })
        .then(res => downloadBlob(res.Body, keyObject.replace(this.state.username+"/", "")));
  }
  
  handleGetUrl = async keyObject => {
    this.setState({ open: true, keyObject: keyObject });
  }
  
  handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ openAlert: false });
  };
  
  handleGetPresignedUrl = async () => {
    console.log(this.state.expires);
    let url = await Storage.get(this.state.keyObject,{ level: 'protected', expires: this.state.expires, download: false });
    this.setState({ presignedUrl: url });
  }
  
  handleDialogClose = () => {
    this.setState({ open: false, keyObject: "", presignedUrl: "", expires: 900 });
  };
  
  handleChange = event => {
    if (event.target.value<60)
      this.setState({ expires: 60 });
    else if (event.target.value>604800)
      this.setState({ expires: 604800 });
    else
      this.setState({ expires: event.target.value });
  };
  
  render(){
    
     const { classes } = this.props;
     
     return(
        <div>
          
          <AppBar position="absolute" color="default" className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" component={Link} to={'/'}>
                <StorageIcon />
              </IconButton>
              <Typography variant="h6" component={Link} to={'/'} className={classes.appBarTitle} color="inherit">
                My Amazon S3 Drive
              </Typography>
              <Button href="#" color="primary" variant="outlined" className={classes.link} onClick={this.handleLogout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          
          <Typography component="h1" variant="h5" color="textPrimary" className={classes.sectionHeader} gutterBottom>
            My Objects
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Paper className={classes.paper}>
                
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    
                    <Typography color="textPrimary" align="center" gutterBottom>
                      Select a file to upload
                    </Typography>
                    
                    <TextField
                      label="File"
                      id="outlined-margin-normal"
                      value={this.state.myFileName}
                      className={classes.textField}
                      margin="dense"
                      variant="outlined"
                      fullWidth
                      disabled
                    />
                    
                  </Grid>
                  <Grid item xs={12}>
                    <input
                      type="file"
                      accept="*"
                      style={{ display: "none" }}
                      ref={ref => (this.upload = ref)}
                      onChange={e =>
                        this.setState({
                          myFile: this.upload.files[0],
                          myFileName: this.upload.files[0].name,
                          response: ""
                        })
                      }
                    />
                    <Button
                      onClick={e => {
                        this.upload.value = null;
                        this.upload.click();
                      }}
                      disabled={this.state.isUploading}
                      variant="contained" color="primary" fullWidth
                    >
                      Select file
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.wrapperButtonLoading} >
                      <Button onClick={this.uploadFile} variant="contained" color="secondary" disabled={this.state.myFile!="" ? false : true } fullWidth>{ this.state.isUploading ? "Uploading..." : "Upload File" }</Button>
                      {this.state.isUploading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                  </Grid>
                </Grid>
              
              
              </Paper>
            </Grid>
            <Grid item md={8} xs={12}>
              <Paper className={classes.paper}>
              
                <Grid item xs={12} md={12}>
                  <div>
                    <List dense={false}>
                      { this.state.objects.map(item => (
                        <div key={item.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar>
                                <InsertDriveFileIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={item.id.replace(this.state.username+"/", "") }
                            />
                            <ListItemSecondaryAction className={classes.actionButtons}>
                              <IconButton edge="end" aria-label="link" onClick={() => this.handleGetUrl(item.key_object)}>
                                <LinkIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="download" onClick={() => this.handleDownloadObject(item.key_object)}>
                                <CloudDownloadIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => this.handleDeleteObject(item.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </div>
                      )) }
                    </List>
                  </div>
                </Grid>
                
                {this.state.nextToken!==null && (
                  <Button color="primary" onClick={this.handleClickMore} disableElevation fullWidth>
                    Load more objects
                  </Button>
                )}
              
              </Paper>
            </Grid>
          </Grid>
        
        
          <Snackbar anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }} open={this.state.openAlert} autoHideDuration={5000} onClose={this.handleCloseAlert}>
              <Alert onClose={this.handleCloseAlert} severity={this.state.severityInfo} variant="filled">
                {this.state.messageInfo}
              </Alert>
          </Snackbar>
          
          
          <Dialog open={this.state.open} onClose={this.handleDialogClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Get presigned URL: {this.state.keyObject.replace(this.state.username+"/", "")}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Get a presigned URL of a stored file.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="expires"
                label="Expires"
                type="number"
                value={this.state.expires}
                helperText="Validity of the URL, in seconds."
                onChange={this.handleChange}
                InputProps={{ inputProps: { min: 60, max: 604800 } }}
                fullWidth
              />
              <Button onClick={this.handleGetPresignedUrl} variant="contained" color="primary" fullWidth>Get a presigned URL</Button>
              <TextField
                label="Presigned URL"
                id="outlined-margin-normal"
                value={this.state.presignedUrl}
                className={classes.textField}
                margin="dense"
                variant="outlined"
                fullWidth
                disabled
              />
              
              <CopyToClipboard text={this.state.presignedUrl}
                onCopy={() => this.setState({copied: true})}>
                <Button variant="contained" color="secondary" onClick={() => this.setState({ openAlert: true, severityInfo: "success", messageInfo: "Copied to clipboard." }) } fullWidth>Copy presigned URL to clipboard</Button>
              </CopyToClipboard>
              
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="primary">
                Ok
              </Button>
            </DialogActions>
          </Dialog>
      
  
        </div>
       );
  }
}

export default withAuthenticator(withStyles(useStyles)(ManageFiles));
