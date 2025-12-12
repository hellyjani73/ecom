import { AppBar, Avatar, Container, IconButton, Toolbar, Typography, useMediaQuery, useTheme, Box } from '@mui/material'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import images from '../assets/images'


const NotFoundPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const [openSidebar, setOpenSidebar] = React.useState(!isMobile);

    const handleDrawerToggle = () => {
        setOpenSidebar(!openSidebar);
    };

    return (
        <>
            <Helmet>
                <title>Employees</title>
            </Helmet>
            <div className="wrapper">
                <div className={`layout ${openSidebar ? 'open' : ''}`}>
                    <AppBar
                        position="fixed"
                        color="default"
                        className={`header ${openSidebar ? 'open' : ''}`}
                    >
                        <Toolbar>
                            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerToggle}
                                    edge="start"
                                    sx={{ mr: 1 }}
                                >
                                    <Avatar src={images.MenuCollapsible} alt="MenuCollapsible" />
                                </IconButton>
                                {isDesktop && (
                                    <Typography variant="h5" noWrap component="p" className="mb-6p">
                                        Ecom
                                    </Typography>
                                )}
                                {isMobile && (
                                    <Link to="/" className="d-inline-flex">
                                        <Typography variant='h4'>
                                            Ecom
                                        </Typography>
                                    </Link>
                                )}
                            </Box>
                        </Toolbar>
                    </AppBar>
                   
                    <div className="main-content">
                        {isMobile && (
                            <Typography variant="h5" noWrap component="p" className="mb-25p font-MaderaMedium">

                            </Typography>
                        )}
                        <Helmet>
                            <title>404</title>
                            <meta name="description" content="404" />
                        </Helmet>
                        <Container maxWidth="xl" className="pt-md-6 pb-md-3 py-3 my-5">
                            <div className="text-center">
                                <Typography variant="h1" className="font-MaderaMedium mb-15p">
                                    404
                                </Typography>
                                <Typography variant="h4" className="font-BitterMedium mb-2">
                                    Page Not Found!
                                </Typography>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotFoundPage
