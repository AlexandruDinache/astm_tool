import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import SyncIcon from '@material-ui/icons/Sync';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

import IncomingMessages from './IncomingMessages.js';

const styles = theme => ({
  root: {
    flexGrow: 1,
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2
  },
  bar: {
    paddingTop: theme.spacing.unit * 2
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  outMessage: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "98%"
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'absolute',
    right: 0
  },
  fab: {
    margin: theme.spacing.unit * 2
  },
  button: {
    margin: theme.spacing.unit
  },
});

class App extends Component {

  render() {
    return (
      <div className="App">
        <AppBar position="sticky" color="default" className="bar">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              ASTM TOOL (CLIENT)
            </Typography>
            <form className={this.props.classes.container} noValidate autoComplete="off">
              <TextField
                id="outlined-name"
                label="IP"
                className={this.props.classes.textField}
                margin="normal"
              />
              <TextField
                id="outlined-name"
                label="PORT"
                className={this.props.classes.textField}
                margin="normal"
              />
              <Fab color="primary" aria-label="Add" className={this.props.classes.fab}>
                <SyncIcon />
              </Fab>
            </form>
          </Toolbar>
        </AppBar>
        <Paper className={this.props.classes.root} elevation={1}>
          <Typography variant="h5" component="h3">
            Outgoing Messages:
          </Typography>
          <TextField
            id="outlined-multiline-static"
            label="Message"
            multiline
            rows="15"
            className={this.props.classes.outMessage}
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div>
            <Button variant="contained" className={this.props.classes.button}>
              clear
            </Button>
            <Button variant="contained" className={this.props.classes.button}>
              send
            </Button>
          </div>
        </Paper>
        <IncomingMessages />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
