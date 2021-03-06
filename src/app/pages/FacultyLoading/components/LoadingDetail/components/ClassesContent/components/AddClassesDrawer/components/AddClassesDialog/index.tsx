import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { inject, observer } from "mobx-react";
import * as React from "react";
import FormSubmitBar from "../../../../../../../../../../components/reusable/FormSubmitBar";
import FacultyLoadingController from "../../../../../../../../../../controllers/faculty_loading";
import FormClassSchedule from "../../../../../../../../../../models/entities/form_class_schedule";
import { MeetingDaysReadable } from "../../../../../../../../../../models/enums/meeting_days";
import { MeetingHoursReadable } from "../../../../../../../../../../models/enums/meeting_hours";
import SubjectCategory from "../../../../../../../../../../models/enums/subject_category";
import { FacultyLoadingState } from "../../../../../../../../../../store/faculty_loading";

interface IPropsType {
    facultyLoading?: FacultyLoadingState;
    pendingClasses: FormClassSchedule[];
}

@inject("facultyLoading")
@observer
export default class AddClassesDialog extends React.Component<IPropsType> {
    public state = {
        fromPreviousCourses: false,
    };

    public toggleFromPreviousCourses = () => {
        this.setState({
            fromPreviousCourses: !this.state.fromPreviousCourses,
        });
        const { facultyLoading } = this.props;
        const { form } = facultyLoading!.classesTabState.addClassDialogState;
        form.course = "";
    };

    public onClose = () => {
        FacultyLoadingController.toggleAddClassesDialog(false);
    };

    public onChange = (
        property: string
    ): React.ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    > => event => {
        const { facultyLoading } = this.props;
        const { form } = facultyLoading!.classesTabState.addClassDialogState;
        form[property] = event.target.value;
    };

    public forAdjunctChange = (
        event: React.ChangeEvent,
        forAdjunct: boolean
    ) => {
        const { facultyLoading } = this.props;
        const {
            classesTabState: { addClassDialogState },
        } = facultyLoading!;
        const { form } = addClassDialogState;
        form.forAdjunct = forAdjunct;
    };

    public onSubmitClick = () => {
        FacultyLoadingController.addClassToForm();
    };

    public render() {
        const { fromPreviousCourses } = this.state;
        const { facultyLoading, pendingClasses } = this.props;
        const {
            classesTabState: {
                addClassDialogState,
                addClassesDrawerState: {
                    form: { subjectId },
                },
                classSchedules,
                subjects,
                courses,
            },
        } = facultyLoading!;
        const {
            isShowing,
            validationErrors,
            form,
            canSubmit,
        } = addClassDialogState;

        const subject = subjects!.find(s => s.id === subjectId);

        const consolidatedClasses = [
            ...Array.from(classSchedules!.values()),
            ...pendingClasses,
        ].filter(
            c =>
                c.meetingHours === form.meetingHours &&
                c.meetingDays === form.meetingDays
        );

        const noConflictingRoom = consolidatedClasses.every(
            pc => pc.room !== form.room
        );

        const noConflictingSection = consolidatedClasses.every(
            cs => cs.section !== form.section
        );

        return (
            <Dialog
                open={isShowing}
                onClose={this.onClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Class</DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        direction="column"
                        spacing={24}
                        alignItems="stretch"
                    >
                        <Grid item>
                            <TextField
                                select
                                label="Meeting Days"
                                variant="outlined"
                                onChange={this.onChange("meetingDays")}
                                value={form.meetingDays}
                                error={"meetingDays" in validationErrors}
                                helperText={validationErrors.meetingDays}
                                fullWidth
                            >
                                {Array.from(MeetingDaysReadable).map(
                                    ([typeEnum, typeReadable]: any) => (
                                        <MenuItem
                                            key={typeEnum}
                                            value={typeEnum}
                                        >
                                            {typeReadable}
                                        </MenuItem>
                                    )
                                )}
                            </TextField>
                        </Grid>
                        <Grid item>
                            <TextField
                                select
                                label="Meeting Hours"
                                variant="outlined"
                                onChange={this.onChange("meetingHours")}
                                value={form.meetingHours}
                                error={"meetingHours" in validationErrors}
                                helperText={validationErrors.meetingHours}
                                fullWidth
                            >
                                {Array.from(MeetingHoursReadable).map(
                                    ([typeEnum, typeReadable]: any) => (
                                        <MenuItem
                                            key={typeEnum}
                                            value={typeEnum}
                                        >
                                            {typeReadable}
                                        </MenuItem>
                                    )
                                )}
                            </TextField>
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Room"
                                variant="outlined"
                                required
                                onChange={this.onChange("room")}
                                value={form.room}
                                error={"room" in validationErrors}
                                helperText={validationErrors.room}
                                fullWidth
                            />
                        </Grid>
                        {!noConflictingRoom && (
                            <Grid item>
                                <Typography variant="subtitle2" color="error">
                                    The rooms conflict with another entry with
                                    the same day and time
                                </Typography>
                            </Grid>
                        )}
                        <Grid item container direction="row" spacing={8}>
                            <Grid item>
                                <TextField
                                    select
                                    label="Year"
                                    variant="outlined"
                                    onChange={this.onChange("studentYear")}
                                    value={form.studentYear}
                                    error={"studentYear" in validationErrors}
                                    helperText={validationErrors.studentYear}
                                    fullWidth
                                >
                                    {Object.entries({
                                        "1": "I",
                                        "2": "II",
                                        "3": "III",
                                        "4": "IV",
                                    }).map(([value, readable]) => (
                                        <MenuItem key={value} value={value}>
                                            {readable}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    label="Section"
                                    variant="outlined"
                                    required
                                    onChange={this.onChange("section")}
                                    value={form.section}
                                    error={"section" in validationErrors}
                                    helperText={validationErrors.section}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        {!noConflictingSection && (
                            <Grid item>
                                <Typography variant="subtitle2" color="error">
                                    The sections conflict with another entry
                                    with the same day and time
                                </Typography>
                            </Grid>
                        )}
                        {fromPreviousCourses && courses && courses.length > 0 && (
                            <Grid item>
                                <TextField
                                    select
                                    label="Course"
                                    variant="outlined"
                                    required
                                    onChange={this.onChange("course")}
                                    value={form.course}
                                    error={"course" in validationErrors}
                                    helperText={validationErrors.course}
                                    fullWidth
                                >
                                    {courses!.map(c => (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                        {!fromPreviousCourses && (
                            <Grid item>
                                <TextField
                                    label="Course"
                                    variant="outlined"
                                    required
                                    onChange={this.onChange("course")}
                                    value={form.course}
                                    error={"course" in validationErrors}
                                    helperText={validationErrors.course}
                                    fullWidth
                                />
                            </Grid>
                        )}
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={this.toggleFromPreviousCourses}
                                disabled={
                                    !courses ||
                                    (courses && courses.length === 0)
                                }
                            >
                                {fromPreviousCourses
                                    ? "Add new course"
                                    : "Select from previous courses"}
                            </Button>
                        </Grid>
                        {subject &&
                            subject!.category === SubjectCategory.General && (
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.forAdjunct}
                                                onChange={this.forAdjunctChange}
                                            />
                                        }
                                        label="For adjunct"
                                    />
                                </Grid>
                            )}
                        <Grid item container direction="row" spacing={24}>
                            <Grid item>
                                <FormSubmitBar
                                    disabled={
                                        !canSubmit ||
                                        !noConflictingRoom ||
                                        !noConflictingSection
                                    }
                                    formState={addClassDialogState}
                                    onSubmitClick={this.onSubmitClick}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}
