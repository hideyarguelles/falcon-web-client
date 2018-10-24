import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import { inject, observer } from "mobx-react";
import * as React from "react";
import StateWrapper from "../../components/reusable/StateWrapper";
import FacultyLoadingController from "../../controllers/faculty_loading";
import IStyleClasses from "../../interfaces/style_classes";
import { FacultyLoadingState } from "../../store/faculty_loading";
import FacultyOverview from "../FacultyLoading/components/LoadingDetail/components/FacultyContent/components/FacultyOverview";
import FacultySchedule from "../FacultyLoading/components/LoadingDetail/components/FacultyContent/components/FacultySchedule";
import styles from "./styles";

interface IPropsType {
    facultyLoading?: FacultyLoadingState;
    classes: IStyleClasses;
}

@inject("facultyLoading")
@observer
class MySchedule extends React.Component<IPropsType> {
    public componentDidMount() {
        document.title = "My Schedule - Falcon";
        FacultyLoadingController.getCurrentFaculty();
    }

    public render() {
        const { facultyLoading, classes } = this.props;
        const { facultyTabState } = facultyLoading!;
        const { activeFaculty } = facultyTabState;
        return (
            <StateWrapper fetchableState={facultyTabState.fetchStatus}>
                {() => (
                    <Grid
                        item
                        container
                        justify="center"
                        className={classes.content}
                    >
                        <Grid item>
                            <FacultyOverview facultyMember={activeFaculty!} />
                        </Grid>
                        <Grid item>
                            <FacultySchedule facultyMember={activeFaculty!} />
                        </Grid>
                    </Grid>
                )}
            </StateWrapper>
        );
    }
}

export default withStyles(styles)(MySchedule);
