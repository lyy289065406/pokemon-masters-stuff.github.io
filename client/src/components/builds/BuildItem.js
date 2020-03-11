import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactTooltip from 'react-tooltip';
import { HexGrid, Layout, Hexagon, Text, Pattern } from '../Hexagon';
import styles from './styles';
import {
  getFillColorByMoveType,
  renderMoveName,
  addSyncLvReq
} from '../../utils/functions';
import {
  pikachuGridData,
  torkoalGridData,
  infernapeGridData,
  dewgongGridData,
  haxorusGridData,
  kingdraGridData,
  serperiorGridData,
  vileplumeGridData,
  mewGridData,
  metagrossGridData,
  charizardGridData,
  palossandGridData,
  liepardGridData,
  rotomGridData,
  houndoomGridData,
  raichuGridData,
  alakazamGridData
} from '../../data';
import {
  selectPokemon,
  addToGridList,
  removeFromGridList,
  subtractFromRemainingEnergy,
  addBackToRemainingEnergy,
  resetGrids
} from '../../actions/actionCreators';
import {
  charizard,
  pikachu,
  raichu,
  vileplume,
  alakazam,
  dewgong,
  mew,
  houndoom,
  kingdra,
  torkoal,
  infernape,
  metagross,
  rotom,
  serperior,
  liepard,
  palossand,
  haxorus
} from '../../images/PokemonThumbnails/';

const allThumbnails = {
  charizard,
  pikachu,
  raichu,
  vileplume,
  alakazam,
  dewgong,
  mew,
  houndoom,
  kingdra,
  torkoal,
  infernape,
  metagross,
  rotom,
  serperior,
  liepard,
  palossand,
  haxorus
};

const allSyncGrids = {
  pikachuGridData,
  torkoalGridData,
  infernapeGridData,
  dewgongGridData,
  haxorusGridData,
  kingdraGridData,
  serperiorGridData,
  vileplumeGridData,
  mewGridData,
  charizardGridData,
  metagrossGridData,
  palossandGridData,
  liepardGridData,
  rotomGridData,
  houndoomGridData,
  raichuGridData,
  alakazamGridData
};

// const gridUrlLookUpData = {}; // Used this to generate data/grids/allDisplacedGridData;
class BuildItem extends Component {
  state = {
    initialRender: true,
    mapSizeBoundaries: {
      width: '100vw',
      height: 440,
      viewbox: '-35 -35 70 70'
    },
    screenWidth: document.body.clientWidth
  };

  componentDidMount() {
    setTimeout(() => this.fitMapToScreen(), 1000);
    window.addEventListener('resize', this.fitMapToScreen);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fitMapToScreen);
  }

  fitMapToScreen = () => {
    const clientWrappingBoundaries = {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    };
    let updatedMapSizeBoundaries = {
      ...this.state.mapSizeBoundaries
    };

    if (clientWrappingBoundaries.width > 1200) {
      updatedMapSizeBoundaries = {
        width: 800,
        height: 768,
        viewbox: '-50 -50 100 100'
      };
    }

    if (
      clientWrappingBoundaries.width > 960 &&
      clientWrappingBoundaries.width < 1200
    ) {
      updatedMapSizeBoundaries = {
        width: '100vw',
        height: 768,
        viewbox: '-15 -50 100 100'
      };
    }

    if (clientWrappingBoundaries.width <= 960) {
      updatedMapSizeBoundaries = {
        width: '100vw',
        height: 768,
        viewbox: '-50 -50 100 100'
      };
    }

    if (clientWrappingBoundaries.width < 768) {
      updatedMapSizeBoundaries = {
        width: '100vw',
        height: (
          ((clientWrappingBoundaries.width / 100) * 73.28) / 2 +
          clientWrappingBoundaries.width
        ).toFixed(),
        viewbox: '-35 -35 70 70'
      };
    }

    this.setState(prevState => ({
      ...prevState,
      initialRender: false,
      mapSizeBoundaries: {
        ...prevState.mapSizeBoundaries,
        ...updatedMapSizeBoundaries
      }
    }));
  };

  renderHexagonCells = classes =>
    allSyncGrids[`${this.props.pokemon}GridData`].map((cell, index) => {
      // remove "Move:" from the start of moveName
      let moveName =
        cell.move.name.substring(0, 5) === 'Move:'
          ? cell.move.name.substring(6)
          : cell.move.name;

      const nameWithSyncLvRequirement = addSyncLvReq(
        this.props.pokemon,
        cell,
        moveName
      );

      const hexagonProps = {
        data: {
          cellId: cell.cellId,
          name: nameWithSyncLvRequirement || moveName,
          description: cell.move.description,
          energy: cell.move.energyCost
        },
        onMouseEnter: this.mouseEnter,
        onMouseLeave: this.mouseLeave,
        key: cell.cellId,
        q: cell.coords.q,
        r: cell.coords.r,
        s: 0,
        fill: getFillColorByMoveType({
          type: cell.ability.type,
          group: cell.move.group,
          isLocked: cell.move.locked
        }),
        className: this.props.darkMode
          ? this.props.grid.selectedCellsById[cell.cellId]
            ? 'selected dark-mode'
            : 'dark-mode'
          : this.props.grid.selectedCellsById[cell.cellId]
          ? 'selected'
          : null
      };

      return (
        <Hexagon {...hexagonProps}>
          <Text className={this.props.darkMode ? classes.darkMode : null}>
            {renderMoveName(cell.move.name, cell.ability.abilityId)}
          </Text>
          {this.state.screenWidth < 960 &&
          cell.move.energyCost !== undefined ? (
            <text
              className="energy-inside-grid"
              textAnchor="middle"
              x="0"
              y="1.6em"
              style={this.props.darkMode ? { fill: 'white' } : null}
            >
              ({cell.move.energyCost})
            </text>
          ) : null}
        </Hexagon>
      );
    });

  renderCenterGridText = classes => {
    // Only renders text when no picture available
    return allThumbnails[`${this.props.pokemon}`] === undefined ? (
      <Text className={classes.selectedPokemonCell}>{this.props.pokemon}</Text>
    ) : null;
  };

  render() {
    const { mapSizeBoundaries, initialRender } = this.state;
    const { classes } = this.props;

    return initialRender ? (
      <div className={classes.progressWrapper}>
        <CircularProgress color="secondary" />
      </div>
    ) : (
      <div>
        <HexGrid
          width={mapSizeBoundaries.width}
          height={mapSizeBoundaries.height}
          viewBox={mapSizeBoundaries.viewbox}
        >
          <Layout
            size={{ x: 4.5, y: 4.5 }}
            flat={true}
            spacing={1.1}
            origin={{ x: 0, y: 0 }}
          >
            <Hexagon
              q={0}
              r={0}
              s={0}
              fill={`url(#${this.props.pokemon})`}
              data={{ cellId: 0 }}
              className={'center-grid'}
            >
              {this.renderCenterGridText(classes)}
            </Hexagon>
            {this.renderHexagonCells(classes)}
          </Layout>
          <Pattern
            id={this.props.pokemon}
            link={allThumbnails[`${this.props.pokemon}`]}
            size={{ x: 10, y: 10 }}
          />
        </HexGrid>
        {this.state.screenWidth >= 960 &&
        this.props.grid.gridData.energy !== undefined ? (
          <ReactTooltip className="tooltip" effect="solid" id="skillTooltip">
            <ul style={{ margin: 0, padding: 0, fontSize: 16 }}>
              <li>{this.props.grid.gridData.name}</li>
              <li>Energy: {this.props.grid.gridData.energy}</li>
              {this.props.grid.gridData.description ? (
                <li style={{ marginTop: 1 }}>
                  {this.props.grid.gridData.description}
                </li>
              ) : null}
            </ul>
          </ReactTooltip>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  pokemon: state.pokemon.selectedPokemon.toLowerCase(),
  grid: state.grid,
  darkMode: state.darkMode.mode
});

export default connect(mapStateToProps, {
  selectPokemon,
  addToGridList,
  removeFromGridList,
  subtractFromRemainingEnergy,
  addBackToRemainingEnergy,
  resetGrids
})(withStyles(styles)(BuildItem));
