import React from 'react';
import styles from './styles/CodeView.css';
import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/light";
import xml from 'react-syntax-highlighter/languages/hljs/xml';
import googlecode from 'react-syntax-highlighter/styles/hljs/googlecode';

registerLanguage('xml', xml);

export default function CodeView(props) {
	return (
		<SyntaxHighlighter id="codeview"
											 className={`form-control mb-1 ${styles.codeView}`}
											 language="xml"
											 style={googlecode}>
			{props.content || ''}
		</SyntaxHighlighter>
	)
}
