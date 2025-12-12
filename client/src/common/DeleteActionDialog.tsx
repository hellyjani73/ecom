/* eslint-disable react/no-danger */
import React from 'react';
import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import images from '../assets/images';
import { Messages } from '../utils/resource';

const DeleteActionDialog = ({ isOpen, handleClose, handleAccept, name, title, id }: any) => {
    return (
        <Dialog
            className="primary-dialog"
            maxWidth="sm"
            open={isOpen}
            onClose={handleClose}
        >
            <DialogTitle>
                <Typography variant="h5" component="p" className="heading">
                    {Messages.ProfileActionDialogTitle}
                </Typography>
                <IconButton className="btn-close-dialog" size="small" color="primary" onClick={handleClose}>
                    <Avatar src={images.CloseGrey} sx={{ width: 24, height: 24 }} alt="CloseGrey" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {/* {`Are you sure you want to ${type === 'In Review' ? 'mark application of' : ''} ${type === 'In Review' ? <span className="font-MaderaBold">{name}</span> : ''
                    }${type !== 'In Review' ? 'this profile' : ''}${type === 'In Review' ? 'as' : ''}${type !== 'In Review' ? `as ${type}` : ` ${type}?`
                    }`} */}
            Are you sure you want to delete {name}{title && ` : ${title}`} ?
            </DialogContent>
            <DialogActions className="justify-content-end">
                <Button color="primary" variant="contained" onClick={() => handleAccept(id)}>
                    YES
                </Button>
                <Button color="primary" variant="outlined" onClick={handleClose}>
                    NO
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteActionDialog;
