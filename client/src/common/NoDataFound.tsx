import { Avatar, Typography } from '@mui/material';
import images from '../assets/images';

const NoDataFound = ({ title, details, className }: any) => (
    <div className={`${className} no-data-found`}>
        <Avatar
            className={`${className?.includes('sm') ? 'mb-15p' : 'mb-25p'} mx-auto`}
            src={images.NoDataFoundsvg}
            alt="NoDataFound"
            variant="square"
            sx={{
                width: {
                    md: className?.includes('sm') ? 80 : 144,
                    xs: className?.includes('sm') ? 64 : 104,
                },
                height: 'auto',
            }}
        />
        <Typography
            variant={className?.includes('sm') ? 'h5' : 'h4'}
            color="primary"
            className="font-MaderaMedium mb-1"
        >
            {title}
        </Typography>
        {details && (
            <Typography variant="body1" className="color-charcoalGrey lnh-145">
                {details}
            </Typography>
        )}
    </div>
);

export default NoDataFound;
