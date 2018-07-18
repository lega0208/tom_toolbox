import React from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import cheerio from 'cheerio';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import ModalPrompt from '../ModalPrompt';
import { setWordConvert, postConvert } from '../../actions/wordConverter';

const { dialog } = remote;

class ImageModal extends React.Component {
	async saveImage() {
		const _$ = cheerio.load(this.props.wordConvert, { decodeEntities: false });
		const img = _$('img').first();
		const srcPath = img.attr('src').replace(/file:\/+/, '');
		console.log(`srcPath: ${srcPath}`);
		const destPath = $(`#save-image`).val();

		if (srcPath) {
			try {
				await copy(srcPath, destPath);
			} catch (e) {
				console.error(e);
			}
		}

		// replace src
		img.attr('src', destPath);
		await this.props.dispatch(setWordConvert(_$));
		await this.props.dispatch(postConvert());
	};
	getSavePath (e) {
		e.preventDefault();
		const savePath = dialog.showSaveDialog({ filters: [{ name: 'image', extensions: ['png', 'jpg'] }] });
		$(`#save-image`).val(savePath);
	};

	componentDidMount() {
		$(document).on('hidden.bs.modal', '#imageModal', () => this.props.dispatch(postConvert()));
		$(document).on('show.bs.modal', '#imageModal', () => $(`#save-image`).val(''));
	}

	render() {
		return (
			<ModalPrompt modalTitle="Image found, would you like to save it?"
									 submitText="Save"
									 submit={e => this.saveImage(e)}
									 modalId="imageModal"
									 modalRef={elem => this.modalRef = elem} >
				<form>
					<div className="form-group">
						<label className="w-100">Select save path:
							<input id="save-image" className="form-control-file" onClick={this.getSavePath} />
						</label>
					</div>
				</form>
			</ModalPrompt>
		);
	}

	componentWillUnmount() {
		$(document).off('hidden.bs.modal', '#imageModal');
	}
}



const mapStateToProps = ({ home: { wordConvert } }) => ({ wordConvert });

export default connect(mapStateToProps)(ImageModal);