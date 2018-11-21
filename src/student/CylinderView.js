import React from 'react';
import {
  AppRegistry,
  AppState,
  Environment,
  StyleSheet,
  NativeModules,
  Text,
  View,
} from 'react-360';
import Entity from 'Entity';
const {VideoModule} = NativeModules;
import {connect} from './Store';
import Marker from './Marker';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

class CylinderView extends React.Component {
  state = {
    count: 90,
    greeting: 'Welcome to VRClassroom!',
    showContent: false,
    playbackPosition: -1,
  };

  componentDidMount() {
    VideoModule.createPlayer('myplayer');

    RCTDeviceEventEmitter.addListener('onVideoStatusChanged', e => {
      this.setState({
        playbackPosition: e.position,
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.state.showContent && this.props.url) {
      this.setState({showContent: true});
    }

    if (prevProps.url != this.props.url) {
      if (this.props.mediatype === 'video') {
        VideoModule.play('myplayer', {
          source: {
            url: this.props.url,
          },
          autoPlay: false,
        });
        Environment.setBackgroundVideo('myplayer');
      } else if (this.props.mediatype === 'photo') {
        Environment.setBackgroundImage(this.props.url);
      }
    }

    if (prevProps.playing != this.props.playing) {
      if (this.props.playing) {
        VideoModule.resume('myplayer');
      } else {
        VideoModule.pause('myplayer');
      }
    }

    if (
      Math.abs(this.state.playbackPosition - this.props.playbackPosition) >= 1
    ) {
      VideoModule.seek('myplayer', this.props.playbackPosition);
    }
  }

  render() {
    return (
      <View>
        {!this.state.showContent ? (
          <View style={{transform: [{translate: [300, -200]}]}}>
            <View style={styles.greetingBox}>
              <Text style={styles.greeting}>{this.state.greeting}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    // Fill the entire surface
    width: 100,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingBox: {
    padding: 20,
    backgroundColor: '#000000',
    borderColor: '#639dda',
    borderWidth: 2,
  },
  greeting: {
    fontSize: 30,
  },
});

const ConnectedCylinderView = connect(CylinderView);

export default ConnectedCylinderView;
