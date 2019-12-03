import React, { Component } from 'react';
import { connect } from 'react-redux';
import CodeView from './CodeView';
import Alert from './Alert';
import TopButtonRow from './TopButtonRow'
import ScriptsBar from './ScriptsBar';
import BottomButtonRow from './BottomButtonRow';
import HomeModal from './Modal';
import { Grid, Row, Col } from 'components/bsComponents';
import {
	initConverter,
	checkCache,
	undo,
	triggerShowPreview
} from 'actions/home';

// const { Menu, MenuItem } = remote;

class Home extends Component {
  copy(toCopy) {
    // todo
  }

	//keydown(e) {
  //	if (e.ctrlKey) {
  //		switch (e.key) { // todo: instead of doing on keydown for this particular component, use sagas to add
  //			               // an event listener and do necessary checks
	//			case 'v': this.props.initConverter();
	//			break;
	//			case 'c': this.copy(this.props.textBox.content);
	//			break;
	//			case 'z': this.props.undo();
	//			break;
	//		}
	//	}
	//}

  componentDidMount() {
  	$(document).on('keydown', (e) => {
		  if (e.ctrlKey) {
			  switch (e.key) { // todo: instead of doing on keydown for this particular component, use sagas to add
				  // an event listener and do necessary checks
				  case 'v': this.props.initConverter();
					  break;
				  case 'c':
				  	console.log('COPY!! :O');
					  break;
				  case 'z': this.props.undo();
					  break;
			  }
		  }
	  });
	  this.props.checkCache()
  }

  render() {
    return (
      <React.Fragment>
        <Alert />
	      <Grid fluid>
		      <Row>
			      <Col col={9} xl={10} xClass="pr-1">
				      <TopButtonRow />
				      <CodeView content={this.props.textContent}/>
				      <BottomButtonRow initConverter={this.props.initConverter}
				                       showPreview={this.props.showPreview}
				      />
			      </Col>
			      <Col col={3} xl={2} xClass="pl-1">
				      <ScriptsBar />
			      </Col>
		      </Row>
	      </Grid>
	      <HomeModal />
      </React.Fragment>
    );
  }

  componentWillUnmount() {
  	// persist to sessionStorage
	  [ // array of home props to persist
	  	'options'
	  ].forEach(
	  	(prop) =>  sessionStorage.setItem(`home.${prop}`, JSON.stringify(this.props[prop]))
	  ); // does this even work?
	  $(document).off('keydown');
  }
}

const mapState = ({
	home: {
		textBox: { content }
	}
}) => ({ textContent: content });
const mapDispatch = {
	initConverter,
	undo,
	checkCache,
	showPreview: triggerShowPreview,
};

export default connect(mapState, mapDispatch)(Home);
