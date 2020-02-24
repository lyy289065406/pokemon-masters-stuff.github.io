import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import SyncGridControls from '../../components/SyncGridControls';
import Navigation from '../../components/Navigation';
import { SelectedSkillListMobile } from '../../components/SelectedSkillList';
import SkillOverview from '../../components/SkillOverview';
import MainAppbar from '../../components/MainAppbar';
import GridMap from '../../components/GridMap';
import styles from './styles';
import { getQueryStringValue, setQueryStringValue } from '../../queryString';
import {
  selectPokemon,
  resetGrids,
  saveCurrentBuild,
  loadSelectedBuild,
  deleteSelectedBuild
} from '../../actions/actionCreators';

const mapStateToProps = state => ({
  pokemon: state.pokemon,
  grid: state.grid,
  savedBuilds: state.grid.savedBuilds.allIds.map(
    id => state.grid.savedBuilds.byIds[id]
  )
});

const mapDispatchToProps = {
  selectPokemon,
  resetGrids,
  saveCurrentBuild,
  loadSelectedBuild,
  deleteSelectedBuild
};

class MobileApp extends Component {
  state = {
    isNavOpened: false,
    isSkillListOpened: false,
    isSaveBuildModalVisible: false,
    isShareModalVisible: false
  };

  newBuildNameRef = React.createRef();

  componentDidMount() {
    ReactGA.pageview(window.location.pathname + window.location.search);
    getQueryStringValue('pokemon')
      ? this.props.selectPokemon(getQueryStringValue('pokemon'))
      : setQueryStringValue('pokemon', this.props.pokemon.selectedPokemon);
  }

  handleOnCloseNav = () => this.setState({ isNavOpened: false });

  handleOnOpenNav = () => this.setState({ isNavOpened: true });

  handleOnCloseSaveBuildModal = () =>
    this.setState({ isSaveBuildModalVisible: false });

  handleOnOpenSaveBuildModal = () =>
    this.setState({ isSaveBuildModalVisible: true });

  handleOnCloseShareModal = () => this.setState({ isShareModalVisible: false }); // New

  handleOnOpenShareModal = () => this.setState({ isShareModalVisible: true });

  handleOnCloseSkillList = () => this.setState({ isSkillListOpened: false });

  handleOnOpenSkillList = () => this.setState({ isSkillListOpened: true });

  handleOnChangePokemon = value => {
    this.props.selectPokemon(value);
    this.props.resetGrids();
    setQueryStringValue('pokemon', value);
    setQueryStringValue('grid', []);
  };

  handleOnChangeSavedBuild = value => {
    this.props.loadSelectedBuild({ buildId: value });
  };

  handleOnDeleteSavedBuild = value => {
    this.props.deleteSelectedBuild({ buildId: value });
  };

  handleOnClickSaveBuild = () => {
    this.handleOnOpenSaveBuildModal();
  };

  handleOnClickShare = () => {
    this.handleOnOpenShareModal();
  };

  handleOnSaveBuild = () => {
    let userConfirmation = true;
    if (this.newBuildNameRef.current.value) {
      // If already has a save with the same name, delete old save
      for (let build in this.props.savedBuilds) {
        if (
          this.props.savedBuilds[build].name ===
          this.newBuildNameRef.current.value
        ) {
          userConfirmation = window.confirm(
            'There is a save with the same name. Do you wish to overwrite it?'
          );
          userConfirmation &&
            this.props.deleteSelectedBuild({
              buildId: this.props.savedBuilds[build].id
            });
        }
      }
      userConfirmation &&
        this.props.saveCurrentBuild({
          selectedPokemon: this.props.pokemon.selectedPokemon,
          buildName: this.newBuildNameRef.current.value
        });
      this.handleOnCloseSaveBuildModal();
    } else {
      alert('Please enter a name');
    }
  };

  render() {
    const {
      isNavOpened,
      isSkillListOpened,
      isSaveBuildModalVisible,
      isShareModalVisible
    } = this.state;
    const { classes, pokemon, grid } = this.props;

    let skillList = Object.keys(grid.selectedCellsById)
      .map(cellId => {
        return grid.selectedCellsById[cellId].name;
      })
      .sort();

    return (
      <>
        <Navigation
          isOpened={isNavOpened}
          onCloseHandler={this.handleOnCloseNav}
        />

        <SelectedSkillListMobile
          isOpened={isSkillListOpened}
          onOpenHandler={this.handleOnOpenSkillList}
          onCloseHandler={this.handleOnCloseSkillList}
          skillList={skillList}
        />

        <MainAppbar
          onOpenNavHandler={this.handleOnOpenNav}
          data={{
            energy: grid.remainingEnergy,
            orbs: grid.orbSpent
          }}
        />

        <div className={classes.mainContainer}>
          <SyncGridControls
            selectedPokemon={pokemon.selectedPokemon}
            onChangePokemonHandler={this.handleOnChangePokemon}
            onChangeSavedBuildHandler={this.handleOnChangeSavedBuild}
            onDeleteSavedBuildHandler={this.handleOnDeleteSavedBuild}
            onOpenSkillListHandler={this.handleOnOpenSkillList}
            onSaveBuildClickHandler={this.handleOnClickSaveBuild}
            onShareClickHandler={this.handleOnClickShare}
          />

          <Grid container alignItems="stretch" justify="center">
            <Grid item xs={12}>
              <div className={classes.syncGridWrapper}>
                <GridMap />
              </div>
            </Grid>
          </Grid>

          <SkillOverview
            skill={grid.gridData.name}
            description={
              grid.gridData.description ? grid.gridData.description : ''
            }
            energy={grid.gridData.energy}
          />
        </div>

        <Dialog
          open={isSaveBuildModalVisible}
          onClose={this.handleOnCloseSaveBuildModal}
        >
          <DialogTitle>{'Save a new build'}</DialogTitle>
          <DialogContent>
            <TextField
              className={classes.buildNameField}
              label="Build name"
              placeholder="Enter a name as a reference"
              inputProps={{ ref: this.newBuildNameRef }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleOnCloseSaveBuildModal}>Cancel</Button>
            <Button onClick={this.handleOnSaveBuild}>Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isShareModalVisible}
          onClose={this.handleOnCloseShareModal}
        >
          <DialogTitle>{'Save this link'}</DialogTitle>
          <DialogContent>
            <TextField
              className={classes.buildNameField}
              // label="Build name"
              // placeholder="Enter a name as a reference"
              // inputProps={{ ref: this.newBuildNameRef }}
              value={window.location.href}
            />
          </DialogContent>
          {/* <DialogActions>
            <Button onClick={this.handleOnCloseSaveBuildModal}>Cancel</Button>
            <Button onClick={this.handleOnSaveBuild}>Save</Button>
          </DialogActions> */}
        </Dialog>
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MobileApp));
