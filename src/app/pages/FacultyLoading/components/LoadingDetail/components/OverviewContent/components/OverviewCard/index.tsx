import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import * as React from "react";

interface IPropsType {
    name?: string;
    message: string;
    onRemoveClick?: () => void;
}

export default class OverviewCard extends React.Component<IPropsType> {
    public render() {
        const { name, message, onRemoveClick } = this.props;
        return (
            <Card square>
                <CardContent>
                    <Grid container direction="column" spacing={16}>
                        {name && (
                            <Grid item>
                                <Typography>{name}</Typography>
                                <Divider />
                            </Grid>
                        )}
                        <Grid item>
                            <Typography variant="subtitle1">
                                {message}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                {onRemoveClick && (
                    <CardActions>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onRemoveClick}
                        >
                            Remove
                        </Button>
                    </CardActions>
                )}
            </Card>
        );
    }
}