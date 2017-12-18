// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import request from 'request';

class NewsFeed extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.foramtUrlParams = this.foramtUrlParams.bind(this);
    this.fetchNewsItems = this.fetchNewsItems.bind(this);
  }

  state = {
    opacity: 0,
    hidden: true,
    intervalId: null,
    refreshId: null,
    showHideTimer: null,
    newsItems: [],
    loaded: false,
    activeItem: -1,
  };

  componentDidMount() {
    this.fetchNewsItems((items) => {
      this.setState({
        loaded: true,
        newsItems: items,
        intervalId: setInterval(() => {
          this.updateModule();
        }, this.props.updateInterval),
        refreshId: setInterval(() => {
          this.fetchNewsItems((items)=>{
            this.setState({
              newsItems: items
            })
          });
        }, this.props.refetchInterval),
      });
      this.updateModule();
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    clearInterval(this.state.refreshId);
    clearTimeout(this.state.showHideTimer);
  }

  hideShowModule(hide: boolean, callback: any) {
    this.setState({
      opacity: hide ? 0 : 1,
      hidden: hide
    });
    if (hide && callback) {
      this.setState({
        showHideTimer: setTimeout(() => { callback(); }, this.props.fadeSpeed / 2),
      });
    } else {
      clearTimeout(this.state.showHideTimer);
    }
  }

  updateModule() {
    if (this.state.newsItems.length > 0) {
      this.hideShowModule(true, () => {
        let index = this.state.activeItem;
        if (this.state.activeItem < this.state.newsItems.length - 1) {
          index += 1;
        } else {
          index = 0;
        }
        this.setState({
          activeItem: index,
        }, () => {
          this.hideShowModule(false);
        });
      });
    }
  }

  foramtUrlParams() {
    let url = `${this.props.apiBase}${this.props.apiVersion}${this.props.apiEndpoint}sources=`;
    url += this.props.sources.join();
    url += `&apiKey=${this.props.apiKey}`;
    console.log(url);
    return url;
  }

  fetchNewsItems(callback) {
    if (!this.props.apiKey) {
      console.log('There is no api Key');
      return;
    }

    const URL = this.foramtUrlParams();
    request({
      method: 'GET',
      url: URL,
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        callback(JSON.parse(body).articles);
      } else {
        callback({ error: `${NewsFeed.moduleName}: Could not load news items.` });
      }
    });
  }

  render() {
    if (!this.props.apiKey) {
      return (
        <div className="small bright">
          Their is no api key in the configuration options for the newsfeed module.
          <br />
          Please check the documentation
        </div>
      );
    }

    if (!this.state.loaded || this.state.activeItem < 0) {
      return (
        <div className="small dimmed">
          {this.props.hideLoading ? '' : 'Loading'}
        </div>
      );
    }

    let sourceTitle;
    let newsTitle;
    let description;
    let fullArticle;
    if (this.state.newsItems.length > 0 && this.state.loaded) {
      if (this.props.showSourceTitle) {
        sourceTitle = (
          <div className="light small dimmed">
            {this.state.newsItems[this.state.activeItem].source.name}
            {
              this.props.showPublishDate &&
              `, ${moment(new Date(this.state.newsItems[this.state.activeItem].publishedAt)).fromNow()}`
            }:
          </div>
        );
      }

      if (this.props.showFullArticle) {
        fullArticle = (
          <iframe
            title={this.state.newsItems[this.state.activeItem].title}
            src={this.state.newsItems[this.state.activeItem].url}
            style={{
              width: '100%',
              top: 0,
              left: 0,
              position: 'fixed',
              height: window.innerHeight,
              border: 'none'
            }}
          />
        );
      } else {
        newsTitle = (
          <div className={`bright medium light ${!this.props.wrapTitle ? ' no-wrap' : ''}`}>
            {this.state.newsItems[this.state.activeItem].title}
          </div>
        );
      }

      if (this.props.showDescription) {
        description = (
          <div className={`small light ${!this.props.wrapDescription ? ' no-wrap' : ''}`}>
            {this.state.newsItems[this.state.activeItem].description}
          </div>
        );
      }

      return (
        <div
          style={{
            transition: `opacity ${(this.props.fadeSpeed / 2)}ms ${this.props.animation}`,
            opacity: this.state.opacity
          }}
        >
          {sourceTitle}
          {newsTitle}
          {fullArticle}
          {description}
        </div>
      );
    }

    return (
      <div className="small dimmed">
        No news articles...
      </div>
    );
  }
}

NewsFeed.moduleName = 'NewsFeed';

NewsFeed.defaultProps = {
  fadeSpeed: 4000,
  refetchInterval: 600000, // call the api every 10 minutes
  updateInterval: 30000, // update the module to change the current item every 30 seconds
  animation: 'ease-in',
  apiEndpoint: 'top-headlines?',
  apiVersion: 'v2/',
  apiBase: 'https://newsapi.org/',
  apiKey: null,
  language: 'en',
  sources: [
    'the-new-york-times',
    'google-news',
  ],
  showSourceTitle: true,
  showPublishDate: true,
  showDescription: true,
  wrapTitle: true,
  wrapDescription: true,
  hideLoading: false,
  showFullArticle: false,
};

NewsFeed.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  sources: PropTypes.array,
  showSourceTitle: PropTypes.bool,
  showPublishDate: PropTypes.bool,
  showDescription: PropTypes.bool,
  wrapTitle: PropTypes.bool,
  wrapDescription: PropTypes.bool,
  hideLoading: PropTypes.bool,
};

export default NewsFeed;
