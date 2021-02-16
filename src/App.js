import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Link } from "react-router-dom";
import Home from './components/Home';
import ManageFiles from './components/ManageFiles';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { Auth } from 'aws-amplify';

const useStyles = theme => ({
  heroContent: {
    padding: theme.spacing(2, 0, 2),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
});


class App extends Component {
  
  render() {
    const { classes } = this.props;
    return (      
       <BrowserRouter>
        <div>
          <Switch>
           <Route path="/" component={Home} exact/>
           <Route path="/manage-files" component={ManageFiles}/>
           <Redirect to="/"/>
          <Route component={Error}/>
         </Switch>
        </div> 
      </BrowserRouter>
    );
  }
}
 
export default withStyles(useStyles)(App);