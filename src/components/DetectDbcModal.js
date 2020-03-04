import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import DBC from '../models/can/dbc';
import OpenDbc from '../api/OpenDbc';
import Modal from './Modals/baseModal';
// import GithubDbcList from './GithubDbcList';
import DetectDbcList from './DetectDbcList';

export default class DetectDbcModal extends Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    onDbcSelected: PropTypes.func.isRequired,
    openDbcClient: PropTypes.instanceOf(OpenDbc).isRequired,
    carFingerprint: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      tab: 'Detect DBC',
      tabs: ['Detect DBC'],
      dbc: null,
      dbcSource: null,
      userOpenDbcRepo: null
    };

    this.onDbcLoaded = this.onDbcLoaded.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.renderTabNavigation = this.renderTabNavigation.bind(this);
    this.renderTabContent = this.renderTabContent.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }

  componentWillMount() {
    this.props.openDbcClient.getUserOpenDbcFork().then((userOpenDbcRepo) => {
      this.setState({ userOpenDbcRepo });
    });
  }

  onDbcLoaded(dbcSource, dbcText) {
    const dbc = new DBC(dbcText);
    this.setState({ dbcSource, dbc });
  }

  handleSave() {
    const { dbc, dbcSource } = this.state;
    if (dbc !== null) {
      this.props.onDbcSelected(dbcSource, dbc);
    }
  }

  detectPathQuery(carFingerprint){
      if(carFingerprint){
          if(carFingerprint.toLowerCase().includes("toyota")){
              return "Toyota"
          }else if(carFingerprint.includes("Ford")){
              return "Ford"
          }
      }
  }

  renderTabNavigation() {
    return (
      <div className="cabana-tabs-navigation">
        {this.state.tabs.map((tab) => (
          <a
            className={cx({ 'is-active': this.state.tab === tab })}
            onClick={() => {
              this.setState({ tab });
            }}
            key={tab}
          >
            <span>{tab}</span>
          </a>
        ))}
      </div>
    );
  }

  renderTabContent() {
    const { tab } = this.state;
    if (tab === 'Detect DBC') {
      return (
        <DetectDbcList
          onDbcLoaded={this.onDbcLoaded}
          repo="commaai/opendbc"
          openDbcClient={this.props.openDbcClient}
          carFingerprint={this.props.carFingerprint}
        />
      );
    }
  }

  renderActions() {
    return (
      <div>
        <button className="button--inverted" onClick={this.props.handleClose}>
          <span>Cancel</span>
        </button>
        <button className="button--primary" onClick={this.handleSave}>
          <span>Load DBC</span>
        </button>
      </div>
    );
  }

  render() {
    return (
      <Modal
        title="Detect DBC File"
        handleClose={this.props.handleClose}
        navigation={this.renderTabNavigation()}
        actions={this.renderActions()}
      >
        {this.renderTabContent()}
      </Modal>
    );
  }
}
