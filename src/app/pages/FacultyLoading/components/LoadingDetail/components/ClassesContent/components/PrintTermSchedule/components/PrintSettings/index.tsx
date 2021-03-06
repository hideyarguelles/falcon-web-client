import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import * as _ from "lodash";
import { inject, observer } from "mobx-react";
import * as React from "react";
import FacultyLoadingController from "../../../../../../../../../../controllers/faculty_loading";
import { FacultyLoadingState } from "../../../../../../../../../../store/faculty_loading";

interface IPropsType {
    facultyLoading?: FacultyLoadingState;
}

@inject("facultyLoading")
@observer
export default class PrintSettings extends React.Component<IPropsType> {
    public onYearChange = (event: any) => {
        const { facultyLoading } = this.props;
        const { classesTabState } = facultyLoading!;
        const { printTermScheduleState } = classesTabState;
        if (event.target.value === 0) {
            printTermScheduleState.yearFilter = 0;
        } else {
            printTermScheduleState.yearFilter = event.target.value;
            FacultyLoadingController.getYear(event.target.value);
        }
    };

    public onCourseChange = (event: any) => {
        const { facultyLoading } = this.props;
        const { classesTabState } = facultyLoading!;
        const { printTermScheduleState } = classesTabState;
        if (event.target.value === "None") {
            printTermScheduleState.courseFilter = "";
        } else {
            printTermScheduleState.courseFilter = event.target.value;
        }
    };

    public onSubjectChange = (event: any) => {
        const { facultyLoading } = this.props;
        const { classesTabState } = facultyLoading!;
        const { printTermScheduleState } = classesTabState;
        if (event.target.value === "None") {
            printTermScheduleState.subjectFilter = "";
        } else {
            printTermScheduleState.subjectFilter = event.target.value;
        }
    };

    public onAdjunctChange = (event: React.ChangeEvent, filter: boolean) => {
        const { facultyLoading } = this.props;
        const {
            classesTabState: { printTermScheduleState },
        } = facultyLoading!;
        printTermScheduleState.adjunctFilter = filter;
    };

    public render() {
        const { facultyLoading } = this.props;
        const { terms, year, classesTabState } = facultyLoading!;
        const {
            classSchedules,
            printTermScheduleState: {
                yearFilter,
                courseFilter,
                subjectFilter,
                adjunctFilter,
            },
        } = classesTabState;
        const noYearFilter = yearFilter === 0;
        const noCourseFilter = courseFilter === "";
        const noSubjectFilter = subjectFilter === "";

        const years: number[] = [];
        const courses: string[] = [];
        const subjects: string[] = [];
        Array.from(classSchedules!.values()).map(cs => {
            courses.push(cs.course);
            subjects.push(cs.subjectCode);
        });
        Array.from(terms!.values()).map(term => {
            years.push(term.startYear);
        });

        if (!noYearFilter && year) {
            year!.map(term => {
                term.classSchedules!.map(cs => {
                    courses.push(cs.course);
                    subjects.push(cs.subjectCode);
                });
            });
        }

        const uniqueYears = _.uniq(years);
        const uniqueCourses = _.uniq(courses);
        const uniqueSubjects = _.uniq(subjects);

        let filteredYears = [];
        filteredYears = uniqueYears;
        if (!noYearFilter) {
            filteredYears = uniqueYears.filter(y => y === yearFilter);
        }

        let filteredCourses = [];
        filteredCourses = uniqueCourses;
        if (!noCourseFilter) {
            filteredCourses = uniqueCourses.filter(
                course => course === courseFilter
            );
        }

        let filteredSubjects = [];
        filteredSubjects = uniqueSubjects;
        if (!noSubjectFilter) {
            filteredSubjects = uniqueSubjects.filter(
                subject => subject === subjectFilter
            );
        }

        return (
            <Grid container direction="column" spacing={24}>
                <Typography variant="h6">Term Filters</Typography>
                <Grid item>
                    <TextField
                        label="Filter by school year"
                        variant="outlined"
                        value={yearFilter || ""}
                        select
                        onChange={this.onYearChange}
                        fullWidth
                    >
                        <MenuItem value={0}>None</MenuItem>
                        {filteredYears &&
                            filteredYears.map(y => (
                                <MenuItem key={y} value={y}>
                                    {`${y} - ${y + 1}`}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                        label="Filter by course"
                        variant="outlined"
                        value={courseFilter || ""}
                        select
                        onChange={this.onCourseChange}
                        fullWidth
                    >
                        <MenuItem value="">None</MenuItem>
                        {filteredCourses &&
                            filteredCourses.map(course => (
                                <MenuItem key={course} value={course}>
                                    {course}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                        label="Filter by subject"
                        variant="outlined"
                        value={subjectFilter || ""}
                        select
                        onChange={this.onSubjectChange}
                        fullWidth
                    >
                        <MenuItem value="">None</MenuItem>
                        {filteredSubjects &&
                            filteredSubjects.map(subject => (
                                <MenuItem key={subject} value={subject}>
                                    {subject}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={adjunctFilter}
                                onChange={this.onAdjunctChange}
                            />
                        }
                        label="View adjunct only"
                    />
                </Grid>
            </Grid>
        );
    }
}
