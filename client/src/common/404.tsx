import { AppBar, Avatar, Container, Grid, Hidden, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import images from '../assets/images'
import AuthenticationDrawer from '../components/Navigation/AuthenticationDrawer'

const NotFoundPage: React.FC = () => {
    const theme = useTheme();
    const mobileMenu = useMediaQuery(theme.breakpoints.down('lg'));
    const [openSidebar, setOpenSidebar] = React.useState(!mobileMenu);

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
                            <Grid container>
                                <Grid item xs>
                                    <div className="d-flex align-items-center">
                                        <IconButton
                                            color="inherit"
                                            aria-label="open drawer"
                                            onClick={handleDrawerToggle}
                                            edge="start"
                                            sx={{ mr: 1 }}
                                        >
                                            <Avatar src={images.MenuCollapsible} alt="MenuCollapsible" />
                                        </IconButton>
                                        <Hidden lgDown>
                                            <Typography variant="h5" noWrap component="p" className="mb-6p">
                                                ClothiQ
                                            </Typography>
                                        </Hidden>
                                        <Hidden lgUp>
                                            <Link to="/" className="d-inline-flex">
                                                <Typography variant='h4'>
                                                    ClothiQ
                                                </Typography>
                                            </Link>
                                        </Hidden>
                                    </div>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <AuthenticationDrawer
                        isOpen={openSidebar}
                        mobileMenu={mobileMenu}
                        handleDrawerToggle={handleDrawerToggle}
                    />
                    <div className="main-content">
                        <Hidden lgUp>
                            <Typography variant="h5" noWrap component="p" className="mb-25p font-MaderaMedium">

                            </Typography>
                        </Hidden>
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
