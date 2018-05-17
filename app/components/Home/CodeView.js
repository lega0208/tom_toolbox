import React, { Component } from 'react';
import styles from './styles/CodeView.css';
import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/light";
import xml from 'react-syntax-highlighter/languages/hljs/xml';
import googlecode from 'react-syntax-highlighter/styles/hljs/googlecode';

registerLanguage('xml', xml);

export default class CodeView extends Component {
  render() {
		// const CodeViewComponent = () => ( // remove once it seems like no issues will arise
		// 	<pre className={`form-control mb-1 ${styles.codeView}`}>
		// 		<code id="codeview">{this.props.content}</code>
		// 	</pre>
		// );
    return (
			<SyntaxHighlighter id="codeview"
												 className={`form-control mb-1 ${styles.codeView}`}
												 language="xml"
												 style={googlecode}>
				{this.props.content || ''}
			</SyntaxHighlighter>
		)
  }
}
