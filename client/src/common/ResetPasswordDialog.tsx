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
import { UserRole } from '../services/types/common';

type ResetPasswordDialogProps = {
    isOpen: boolean;
    handleClose: () => void;
    handleAccept: (id: string, userType: string) => void;
    name: string;
    id: string;
    userType: string;
};

const ResetPasswordDialog = ({
    isOpen,
    handleClose,
    handleAccept,
    name,
    id,
    userType,
}: ResetPasswordDialogProps) => {
    const getPasswordHint = () => {
        switch (userType.toLowerCase()) {
            case UserRole.SUPERADMIN.toLowerCase():
                return 'The new password will be: SuperAdmin@123';
            case UserRole.ADMIN.toLowerCase():
                return 'The new password will be: Admin@123';
            default:
                return '';
        }
    };

    return (
        <Dialog
            className="primary-dialog"
            maxWidth="sm"
            open={isOpen}
            onClose={handleClose}
        >
            <DialogTitle>
                <Typography variant="h5" component="p" className="heading">
                    {Messages.ProfileActionDialogTitle || 'Reset Password'}
                </Typography>
                <IconButton className="btn-close-dialog" size="small" color="primary" onClick={handleClose}>
                    <Avatar src={images.CloseGrey} sx={{ width: 24, height: 24 }} alt="CloseGrey" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to reset the password for <strong>{name}</strong>?
                </Typography>
                {userType && (
                    <Typography sx={{ mt: 2, fontWeight: 500, color: 'red' }}>
                        {getPasswordHint()}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions className="justify-content-end">
                <Button color="primary" variant="contained" onClick={() => handleAccept(id, userType)}>
                    YES
                </Button>
                <Button color="primary" variant="outlined" onClick={handleClose}>
                    NO
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResetPasswordDialog;
