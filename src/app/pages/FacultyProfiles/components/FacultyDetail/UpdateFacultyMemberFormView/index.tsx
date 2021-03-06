import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { inject, observer } from "mobx-react";
import * as React from "react";
import DrawerForm from "../../../../../components/reusable/DrawerForm";
import FormSubmitBar from "../../../../../components/reusable/FormSubmitBar";
import FacultyProfilesController from "../../../../../controllers/faculty_profiles";
import { ActivityTypeReadable } from "../../../../../models/enums/activity_type";
import { FacultyMemberTypeReadable } from "../../../../../models/enums/faculty_member_type";
import { SexReadable } from "../../../../../models/enums/sex";
import UserType from "../../../../../models/enums/user_type";
import { AuthenticationState } from "../../../../../store/authentication";
import { FacultyProfilesState } from "../../../../../store/faculty_profiles";

interface IPropsType {
    authentication?: AuthenticationState;
    facultyProfiles?: FacultyProfilesState;
}

@inject("facultyProfiles", "authentication")
@observer
export default class UpdateFacultyMemberFormView extends React.Component<
    IPropsType
> {
    public onClose = () => {
        FacultyProfilesController.toggleUpdateFacultyMemberForm(false);
    };

    public onSubmitClick = () => {
        const { facultyProfiles } = this.props;
        const { activeFacultyMember } = facultyProfiles!;
        FacultyProfilesController.updateFacultyMember(activeFacultyMember!.id);
    };

    public onChange = (
        property: string
    ): React.ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    > => event => {
        const { facultyProfiles } = this.props;
        const { form } = facultyProfiles!.updateFacultyMemberFormState;
        form[property] = event.target.value;
    };

    public render() {
        const { facultyProfiles, authentication } = this.props;
        const {
            isShowing,
            form,
            validationErrors,
            canSubmit,
        } = facultyProfiles!.updateFacultyMemberFormState;
        const { currentUser } = authentication!;
        return (
            <DrawerForm
                open={isShowing}
                onClose={this.onClose}
                formTitle="Update Faculty Member"
            >
                <Grid
                    container
                    spacing={24}
                    alignItems="stretch"
                    direction="column"
                >
                    <Grid item container spacing={8} direction="row">
                        <Grid item xs>
                            <TextField
                                label="First Name"
                                variant="outlined"
                                required
                                onChange={this.onChange("firstName")}
                                value={form.firstName}
                                error={"firstName" in validationErrors}
                                helperText={validationErrors.firstName}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                onChange={this.onChange("lastName")}
                                value={form.lastName}
                                error={"lastName" in validationErrors}
                                helperText={validationErrors.lastName}
                                required
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" spacing={8}>
                        <Grid item xs={4}>
                            <TextField
                                label="Faculty ID"
                                variant="outlined"
                                onChange={this.onChange("pnuId")}
                                value={form.pnuId}
                                error={"pnuId" in validationErrors}
                                helperText={validationErrors.pnuId}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            T-
                                        </InputAdornment>
                                    ),
                                }}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                onChange={this.onChange("email")}
                                value={form.email}
                                error={"email" in validationErrors}
                                helperText={validationErrors.email}
                                required
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" spacing={8}>
                        <Grid item xs={4}>
                            <TextField
                                select
                                label="Sex"
                                variant="outlined"
                                onChange={this.onChange("sex")}
                                value={form.sex}
                                error={"sex" in validationErrors}
                                helperText={validationErrors.sex}
                                fullWidth
                            >
                                {Array.from(SexReadable).map(
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
                        <Grid item xs>
                            <TextField
                                label="Date of Birth"
                                variant="outlined"
                                type="date"
                                onChange={this.onChange("birthDate")}
                                value={form.birthDate}
                                error={"birthDate" in validationErrors}
                                helperText={validationErrors.birthDate}
                                required
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" spacing={8}>
                        <Grid item xs>
                            <TextField
                                select
                                label="Faculty Member Type"
                                variant="outlined"
                                onChange={this.onChange("type")}
                                value={form.type}
                                error={"type" in validationErrors}
                                helperText={validationErrors.type}
                                fullWidth
                            >
                                {Array.from(FacultyMemberTypeReadable).map(
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
                        <Grid item xs>
                            {currentUser!.authorization !==
                                UserType.Faculty && (
                                <TextField
                                    select
                                    label="Activity Type"
                                    variant="outlined"
                                    value={form.activity}
                                    onChange={this.onChange("activity")}
                                    error={"activity" in validationErrors}
                                    helperText={validationErrors.activity}
                                    fullWidth
                                >
                                    {Array.from(ActivityTypeReadable).map(
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
                            )}
                        </Grid>
                    </Grid>

                    <Grid item>
                        <FormSubmitBar
                            disabled={!canSubmit}
                            formState={
                                facultyProfiles!.updateFacultyMemberFormState
                            }
                            onSubmitClick={this.onSubmitClick}
                        />
                    </Grid>
                </Grid>
            </DrawerForm>
        );
    }
}
