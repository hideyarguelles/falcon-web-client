import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";
import IStyleClasses from "../../../../../interfaces/style_classes";
import Page from "../../../../../models/enums/page";
import PageDrawer from "../../../PageDrawer";
import styles from "./styles";

interface IPropsType {
    pageTitle: string;
    activePage: Page;
    classes: IStyleClasses;
}

class AppBarTitle extends React.Component<IPropsType> {
    public state = {
        drawerIsShowing: false,
    };

    public makeDrawerToggle = (shouldShow: boolean) => () =>
        this.setState({
            drawerIsShowing: shouldShow,
        });

    public render() {
        const { pageTitle, classes, activePage } = this.props;
        const { drawerIsShowing } = this.state;
        return (
            <Grid container spacing={8} alignItems="center" wrap="nowrap">
                <Grid item>
                    <IconButton
                        color="inherit"
                        onClick={this.makeDrawerToggle(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Grid>
                <Grid item>
                    <Typography color="inherit" className={classes.falconLogo}>
                        Falcon
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography color="inherit" className={classes.pageTitle}>
                        {pageTitle}
                    </Typography>
                </Grid>

                <PageDrawer
                    open={drawerIsShowing}
                    onClose={this.makeDrawerToggle(false)}
                    activePage={activePage}
                />
            </Grid>
        );
    }
}

export default withStyles(styles)(AppBarTitle);
