import React from "react";
import { Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

const useStyles = theme => ({
  myBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing(10)
  },
  myButtons: {
    marginTop: theme.spacing(4),
  },
});

class Home extends React.Component {
    
  constructor(props) {
	super(props);
  }
  
  render(){
    const { classes } = this.props;
     return(
        <div className={classes.myBox}>
         <Container fixed>
           <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              My Amazon S3 Drive
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" component="p">
              Amazon S3 is object storage built to store and retrieve any amount of data from anywhere on the Internet. It’s a simple storage service that offers industry leading durability, availability, performance, security, and virtually unlimited scalability at very low costs.
            </Typography>
            <Grid container justify="center" className={classes.myButtons}>
              <Grid item>
                <Button variant="contained" color="secondary" component={Link} to={ "/manage-files" }>
                  Start sharing files
                </Button>
              </Grid>
            </Grid>
          </Container>
        </div>
       );
  }
}

export default withStyles(useStyles)(Home);
