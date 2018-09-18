import React            from 'react';
import { connect }      from 'react-redux';
import { remote }       from 'electron';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFolder from '@fortawesome/fontawesome-free-regular/faFolder';
import { Button }       from 'components/bsComponents';
import { ModalContent } from 'components/ModalComponent';
import { setSrcMap, submitImages, cancelImages, removeImage, saveImages } from 'actions/home/images';

const { dialog } = remote;


function Images(props) {
	const SubmitButton =
		() => <Button text="Submit" bsClass="success" click={() => props.submitImages(props.srcMap)} />;
	const SaveButton =
		() => <Button text="Save files" bsClass="primary" click={() => props.saveImages(props.srcMap)} />;
	const ButtonGroup = () => (
		<React.Fragment>
			<SaveButton />
			<SubmitButton />
		</React.Fragment>
	);
	const CancelButton = () => <Button text="Cancel" bsClass="danger" click={props.cancelImages} />;

	const ImageForm = ({ oldPath, newPath = '', index }) => {
		const saveImagePath = () => {
			const dialogSettings = {
				filters: [{
					name: 'image',
					extensions: ['png', 'jpg']
				}]
			};
			return (dialog.showSaveDialog(dialogSettings) || '').replace(/file:\/+/, '');
		};

		return (
			<div className="card mb-1">
				<div className="card-body">
					<div className="row mb-3" key={`formgroup-${index}`}>
						<div className="col-9 col-sm-7 col-md-5 mr-0">
							<label key={`label-${index}`} htmlFor={`inputid-${index}`} className="mt-auto">
								<FontAwesomeIcon icon={faFolder} className="mr-1" />
								Select save path:
							</label>
						</div>
						<div className="col-3 col-sm-5 col-md-7 ml-0">
							<img src={oldPath} className="w-100" />
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<div className="input-group">
								<div className="input-group-prepend">
									<button className="btn btn-primary"
									        onClick={() => props.setSrcMap({ [oldPath]: saveImagePath() })}
									>
										Browse
									</button>
								</div>
								<input id={`input-${index}`}
								       key={`inputid-${index}`}
								       className="form-control bg-white"
								       style={{cursor: 'pointer'}}
								       value={newPath}
								       onClick={() => props.setSrcMap({ [oldPath]: saveImagePath() })}
								       readOnly
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const ImageForms = () => (
		<React.Fragment>
			{Object.entries(props.srcMap).map(([srcPath, destPath], i) => (
				<ImageForm key={`form-${i}`} oldPath={srcPath} newPath={destPath} index={i} />
			))}
		</React.Fragment>
	);

	const ImagesScreen = () => (
		<div className="container-fluid">
			<ImageForms />
		</div>
	);

	return (
		<ModalContent modalTitle="Image(s) found, please select save path(s):"
		              submitButton={<ButtonGroup />}
		              cancelButton={<CancelButton />}
		              modalClasses="modal-lg"
		>
			<ImagesScreen />
		</ModalContent>
	);
}

const mapState =
	({ home: { images: { srcMap } } }) => ({ srcMap });
const mapDispatch = (dispatch) => ({
	submitImages: (srcMap) => dispatch(submitImages(srcMap)),
	cancelImages: () => dispatch(cancelImages()),
	removeImage: (i) => dispatch(removeImage(i)),
	setSrcMap: (srcMapFragment) => dispatch(setSrcMap(srcMapFragment)),
	saveImages: (pathsMap) => dispatch(saveImages(pathsMap)),
});

export default connect(mapState, mapDispatch)(Images);