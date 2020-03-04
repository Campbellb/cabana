import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import OpenDbc from '../api/OpenDbc';

export default class DetectDbcList extends Component {
  static propTypes = {
    onDbcLoaded: PropTypes.func.isRequired,
    repo: PropTypes.string.isRequired,
    openDbcClient: PropTypes.instanceOf(OpenDbc).isRequired,
    carFingerprint: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      queryRepopath: null,
      repoPath: props.repo,
      paths: [],
      selectedPath: null,
      carFingerprint: props.carFingerprint || '',
      showingEdit: false,
      pathQuery: ''
    };

    this.updatePathQuery = this.updatePathQuery.bind(this);
    this.showEdit = this.showEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.repo !== this.props.repo) {
      this.props.openDbcClient.list(nextProps.repo).then((paths) => {
        this.setState({ paths, selectedPath: null });
      });
    }
  }

  componentDidMount() {
    this.props.openDbcClient.list(this.props.repo).then((paths) => {
      this.setState({ paths: this.filterPaths(paths) });
    });
  }

  filterPaths(paths){
      const filterTerms = this.state.carFingerprint.split(' ');
      paths = paths.filter((path) => path.indexOf('.dbc') !== -1);
      let filteredPaths = [];
      for(let i=0;i<paths.length;i++){
          for(let j=0; j < filterTerms.length; j++){
              if(paths[i].toLowerCase().includes(filterTerms[0].toLowerCase())){
                  if(!filteredPaths.includes(paths[i])){
                      filteredPaths.push(paths[i])
                  }
              }
          }
      }
      return filteredPaths;
  }

  updatePathQuery(e) {
    this.setState({
      pathQuery: e.target.value
    });
  }

  selectPath(path) {
    this.setState({ selectedPath: path });
    this.props.openDbcClient
      .getDbcContents(path, this.props.repo)
      .then((dbcContents) => {
        this.props.onDbcLoaded(path, dbcContents);
      });
  }

  showEdit() {
      this.setState({ showingEdit: true })
  }

  submitRepoName(input) {
      if(input !== this.state.repoPath) {
          this.props.openDbcClient.list(input).then((paths) => {
            this.setState({ repoPath: input });
            this.setState({ paths, selectedPath: null });
          });
      }
      this.setState({ showingEdit: false })
  }

  updateRepo(input) {
      this.setState({ queryRepopath: input })
  }

  render() {
    return (
      <div className="cabana-dbc-list">
        <div className="cabana-dbc-list-header">
            {this.state.showingEdit ?
                <div>
                <i className="fa fa-github" />
                <input type="text" placeholder="Specify DBC Source Repo" onChange={(e) => this.updateRepo(e.target.value)} />
                </div>
                :
                <div>
                <a href={`https://github.com/${this.props.repo}`} target="_blank">
                    <i className="fa fa-github" />
                    <span>{this.props.repo}</span>
                </a>
                </div>
            }
            <br/>
            {this.state.showingEdit ?
                <button onClick={this.submitRepoName}>Submit</button>
                :
                <button onClick={this.showEdit}>Edit Repo</button>
            }
          <div className="form-field form-field--small">
            <input
              type="text"
              placeholder="Search DBC Files"
              onChange={this.updatePathQuery}
            />
          </div>
        </div>
        <div className="cabana-dbc-list-files">
        {this.state.paths
          .filter(
            (p) => (this.state.pathQuery === '') || p.includes(this.state.pathQuery)
          )
          .map((path) => (
            <div
              className={cx('cabana-dbc-list-file', {
                'is-selected': this.state.selectedPath === path
              })}
              onClick={() => {
                this.selectPath(path);
              }}
              key={path}
            >
              <span>{path}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
