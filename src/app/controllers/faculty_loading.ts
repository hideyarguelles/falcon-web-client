import ClassSchedule from "../models/entities/class_schedule";
import FormClassSchedule from "../models/entities/form_class_schedule";
import Notice from "../models/entities/notice";
import Term from "../models/entities/term";
import FacultyLoadingTab from "../models/enums/faculty_loading_tab";
import FeedbackStatus from "../models/enums/feedback_status";
import FetchableStatus from "../models/enums/fetchable_status";
import FormStatus from "../models/enums/form_status";
import MeetingDays from "../models/enums/meeting_days";
import TermStatus from "../models/enums/term_status";
import FacultyLoadingService from "../services/faculty_loading";
import SubjectsService from "../services/subjects";
import rootStore from "../store";
import { groupById } from "../utils/group_by_id";

const { facultyLoading } = rootStore;

export default class FacultyLoadingController {
    public static getAllTerms() {
        facultyLoading.setStatus(FetchableStatus.Fetching);

        return FacultyLoadingService.fetchAllTerms()
            .then(t => {
                facultyLoading.terms = groupById(t);

                if (t.length > 0) {
                    // Find Max ID (Likely most recent) and make it active
                    this.setActiveTerm(
                        Math.max(...Array.from(facultyLoading.terms.keys()))
                    );
                }

                facultyLoading.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                facultyLoading.setStatus(FetchableStatus.Error, e);
            });
    }

    public static toggleAddTermForm(shouldShow: boolean) {
        facultyLoading.addTermState.isShowing = shouldShow;

        if (!shouldShow) {
            facultyLoading.addTermState.resetAndClose();
        }
    }

    public static submitAddTerm() {
        const { addTermState: formState } = facultyLoading;
        const form = formState.form;
        formState.setStatus(FormStatus.Submitting);

        FacultyLoadingService.addTerm(form)
            .then(t => {
                if (facultyLoading.terms!.size === 0) {
                    facultyLoading.activeTermId = t.id;
                }

                facultyLoading.terms!.set(t.id, t);
                facultyLoading.activeTermId = t.id;
                formState.resetAndClose();
                this.setActiveTerm(t.id);
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static setActiveTerm(id: number) {
        facultyLoading.activeTermId = id;
        const term = facultyLoading.activeTerm!;
        term.setStatus(FetchableStatus.Fetching);

        return FacultyLoadingService.fetchTerm(id)
            .then(t => {
                facultyLoading.terms!.set(id, t);
                if (facultyLoading.activeTerm!.status !== TermStatus.Archived) {
                    this.getCurrentTermStats();
                }
                term.setStatus(FetchableStatus.Fetched);
                if (facultyLoading.activeTab === FacultyLoadingTab.Classes) {
                    this.getAllClassSchedulesTabPrerequisites();
                }
                facultyLoading.termListState.isShowing = false;
            })
            .catch((e: Error) =>
                term.setStatus(FetchableStatus.Error, e.message)
            );
    }

    public static getCurrentTermStats() {
        const state = facultyLoading.currentTermStatsState;
        state.setStatus(FetchableStatus.Fetching);

        return FacultyLoadingService.getCurrentStats()
            .then(stats => {
                facultyLoading.currentTermStatsState.stats = stats;
                state.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                state.setStatus(FetchableStatus.Error, e);
            });
    }

    public static setActiveTab(tab: FacultyLoadingTab) {
        facultyLoading.activeTab = tab;
        if (facultyLoading.activeTab === FacultyLoadingTab.Overview) {
            this.getCurrentTermStats();
        }
    }

    public static toggleTermList(shouldShow: boolean) {
        facultyLoading.termListState.isShowing = shouldShow;
    }

    public static getAllFaculty() {
        const state = facultyLoading.facultyTabState;
        state.setStatus(FetchableStatus.Fetching);

        FacultyLoadingService.fetchAllFaculty(facultyLoading.activeTermId!)
            .then(fm => {
                state.facultyMembers = fm;
                state.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                state.setStatus(FetchableStatus.Error, e);
            });
    }

    public static getCurrentFaculty() {
        facultyLoading.facultyTabState.setStatus(FetchableStatus.Fetching);
        const term = facultyLoading.activeTermId!;

        FacultyLoadingService.fetchCurrentFaculty(term)
            .then(flfm => {
                facultyLoading.facultyTabState.activefacultyId = flfm.facultyId;
                facultyLoading.facultyTabState.facultyMembers = [flfm];
                facultyLoading.facultyTabState.setStatus(
                    FetchableStatus.Fetched
                );
            })
            .catch((e: Error) => {
                facultyLoading.facultyTabState.setStatus(
                    FetchableStatus.Error,
                    e
                );
            });
    }

    public static getAllClassSchedulesTabPrerequisites() {
        const state = facultyLoading.classesTabState;
        state.setStatus(FetchableStatus.Fetching);

        const fetchSubjects = SubjectsService.fetchAllSubjects().then(s => {
            state.subjects = s;
            return s;
        });

        const fetchClassSchedules = FacultyLoadingService.fetchAllClasses(
            facultyLoading.activeTermId!
        )
            .then(cs => {
                state.classSchedules = groupById(cs, "classScheduleId");
                state.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => state.setStatus(FetchableStatus.Error, e));

        Promise.all([fetchSubjects, fetchClassSchedules])
            .then(() => {
                state.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                state.setStatus(FetchableStatus.Error, e);
            });
    }

    public static setActiveFaculty(facultyId: number) {
        const state = facultyLoading.facultyTabState;
        state.activefacultyId = facultyId;
    }

    public static setActiveClassesTab(tab: MeetingDays) {
        const state = facultyLoading.classesTabState;
        state.activeMeetingDays = tab;
    }

    public static showOnlyUnassigned(shouldShow: boolean) {
        const state = facultyLoading.classesTabState;
        state.showOnlyUnassigned = shouldShow;
    }

    public static setActiveClassSchedule(id: number) {
        const state = facultyLoading.classesTabState;
        state.activeClassScheduleId = id;
        this.toggleClassScheduleDetails(true);
    }

    public static toggleClassScheduleDetails(shouldShow: boolean) {
        const state = facultyLoading.classesTabState.classScheduleDetailsState;
        state.isShowing = shouldShow;
    }

    public static async removeClassSchedule(classSchedule: ClassSchedule) {
        const state = facultyLoading.classesTabState;

        return await FacultyLoadingService.removeClassSchedule(
            classSchedule.id
        ).then(() => {
            state.classSchedules!.delete(classSchedule.id);
            this.toggleClassScheduleDetails(false);
        });
    }

    public static toggleTimeConstraintsForm(shouldShow: boolean) {
        const state = facultyLoading.facultyTabState.timeConstraintsFormState;
        state.isShowing = shouldShow;

        if (!shouldShow) {
            state.resetAndClose();
        } else {
            state.form.prefillForm(
                facultyLoading.facultyTabState.activeFaculty!
            );
        }
    }

    public static submitTimeConstraints() {
        const {
            facultyTabState: { timeConstraintsFormState: formState },
        } = facultyLoading;
        const { form } = formState;

        formState.setStatus(FormStatus.Submitting);
        const term = facultyLoading.activeTermId!;

        FacultyLoadingService.submitTimeConstraints(term, form)
            .then(tc => {
                facultyLoading.facultyTabState.activeFaculty!.timeConstraints = tc;
                formState.resetAndClose();
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static toggleFeedbackForm(shouldShow: boolean) {
        const state = facultyLoading.facultyTabState.feedbackFormState;
        state.isShowing = shouldShow;

        if (!shouldShow) {
            state.resetAndClose();
        } else {
            const feedbacks = state.form.classScheduleFeedbacks;
            feedbacks.clear();
            facultyLoading.facultyTabState.activeFaculty!.classSchedules.forEach(
                cs => {
                    feedbacks.set(cs, FeedbackStatus.Accepted);
                }
            );
        }
    }

    public static submitFeedback() {
        const {
            facultyTabState: { feedbackFormState: formState },
        } = facultyLoading;
        const {
            form: { classScheduleFeedbacks },
        } = formState;

        const serverForm: { [key: number]: FeedbackStatus } = {};

        Array.from(classScheduleFeedbacks.entries()).forEach(
            ([cs, feedbackStatus]) => {
                serverForm[cs.id] = feedbackStatus;
            }
        );

        const allAccepted = Array.from(classScheduleFeedbacks.values()).every(
            feedbackStatus => feedbackStatus === FeedbackStatus.Accepted
        );

        formState.setStatus(FormStatus.Submitting);
        const termId = facultyLoading.activeTermId!;

        FacultyLoadingService.submitFeedback(termId, serverForm)
            .then(flfm => {
                facultyLoading.facultyTabState.activefacultyId = flfm.facultyId;
                facultyLoading.facultyTabState.facultyMembers = [flfm];
                facultyLoading.facultyTabState.setStatus(
                    FetchableStatus.Fetched
                );
                formState.resetAndClose();
                if (!allAccepted) {
                    this.toggleTimeConstraintsForm(true);
                }
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static toggleAutoAssignWizardDialog(shouldShow: boolean) {
        const state = facultyLoading.classesTabState.autoAssignWizardState;
        state.isShowing = shouldShow;
    }

    public static toggleUnassignedClassesDialog(shouldShow: boolean) {
        const state =
            facultyLoading.classesTabState.unassignedClassesDialogState;
        state.isShowing = shouldShow;
    }

    public static toggleAssignFacultyDialog(shouldShow: boolean) {
        const state = facultyLoading.classesTabState.assignFacultyDialogState;
        state.isShowing = shouldShow;
    }

    public static advance() {
        facultyLoading.setStatus(FetchableStatus.Fetching);

        FacultyLoadingService.advance()
            .then(t => {
                facultyLoading.terms!.set(t.id, t);
                facultyLoading.activeTermId = t.id;
                facultyLoading.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                alert(`An error occurred: ${e.message}`);
                facultyLoading.setStatus(FetchableStatus.Fetched);
            });
    }

    public static regress() {
        facultyLoading.setStatus(FetchableStatus.Fetching);

        FacultyLoadingService.regress()
            .then(t => {
                facultyLoading.terms!.set(t.id, t);
                facultyLoading.activeTermId = t.id;
                facultyLoading.setStatus(FetchableStatus.Fetched);
            })
            .catch((e: Error) => {
                facultyLoading.setStatus(FetchableStatus.Error, e);
            });
    }

    public static autoAssignFaculty() {
        const state = facultyLoading.classesTabState;
        state.setStatus(FetchableStatus.Fetching);

        FacultyLoadingService.autoAssignFaculty()
            .then(cs => {
                state.classSchedules = groupById(cs);
                state.setStatus(FetchableStatus.Fetched);
                const noAssignments = cs.filter(
                    classSchedule => classSchedule.facultyMember === undefined
                );

                if (noAssignments.length > 0) {
                    this.toggleUnassignedClassesDialog(true);
                }
            })
            .catch((e: Error) => state.setStatus(FetchableStatus.Error, e));
    }

    public static getAllFaculties() {
        const termId = facultyLoading.activeTermId!;
        const csId = facultyLoading.classesTabState.activeClassScheduleId!;
        const state = facultyLoading.classesTabState.assignFacultyDialogState;

        state.fetchStatus = FetchableStatus.Fetching;

        FacultyLoadingService.getAllFaculties(termId, csId)
            .then(faculties => {
                state.recommendedFaculties = faculties;
                state.fetchStatus = FetchableStatus.Fetched;
            })
            .catch((e: Error) => {
                state.fetchStatus = FetchableStatus.Error;
                state.fetchError = e.message;
            });
    }

    public static assignFacultyToClass(facultyId: number) {
        const termId = facultyLoading.activeTermId!;
        const csId = facultyLoading.classesTabState.activeClassScheduleId!;
        const {
            classesTabState: { assignFacultyDialogState: formState },
        } = facultyLoading;
        formState.setStatus(FormStatus.Submitting);

        FacultyLoadingService.assignFacultyToClass(termId, csId, facultyId)
            .then(cs => {
                facultyLoading.classesTabState.classSchedules!.set(cs.id, cs);
                this.toggleClassScheduleDetails(false);
                formState.resetAndClose();
                this.getAllClassSchedulesTabPrerequisites();
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static assignAdjunctToClass() {
        const termId = facultyLoading.activeTermId!;
        const csId = facultyLoading.classesTabState.activeClassScheduleId!;
        const {
            classesTabState: { assignAdjunctDialogState: formState },
        } = facultyLoading;
        const { form } = formState;

        FacultyLoadingService.assignAdjunct(termId, csId, form)
            .then(cs => {
                facultyLoading.classesTabState.classSchedules!.set(cs.id, cs);
                this.toggleClassScheduleDetails(false);
                formState.resetAndClose();
                this.getAllClassSchedulesTabPrerequisites();
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static togglePrintFacultySchedule(shouldShow: boolean) {
        const state = facultyLoading.facultyTabState.printScheduleDialogState;
        state.isShowing = shouldShow;
    }

    public static togglePrintTermSchedule(shouldShow: boolean) {
        facultyLoading.printTermScheduleState.isShowing = shouldShow;
    }

    public static toggleNoticeForm(shouldShow: boolean) {
        facultyLoading.facultyTabState.noticeFormState.isShowing = shouldShow;
    }

    public static submitNotice() {
        const {
            facultyTabState: { noticeFormState: formState },
        } = facultyLoading;
        const { form } = formState;
        const termId = facultyLoading.activeTermId!;

        formState.setStatus(FormStatus.Submitting);

        FacultyLoadingService.submitNotice(termId, form)
            .then(n => {
                formState.resetAndClose();
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static removeNotice(notice: Notice) {
        const notices = facultyLoading.activeTerm!.notices;
        const noticeIndex = notices!.indexOf(notice);
        notices!.splice(noticeIndex, 1);
        const termId = facultyLoading.activeTermId!;

        FacultyLoadingService.removeNotice(termId, notice.id).catch(
            (e: Error) => {
                facultyLoading.setStatus(FetchableStatus.Error, e);
            }
        );
    }

    public static toggleAddClassesDrawer(shouldShow: boolean) {
        facultyLoading.classesTabState.addClassesDrawerState.isShowing = shouldShow;

        if (!shouldShow) {
            facultyLoading.classesTabState.addClassesDrawerState.resetAndClose();
        }
    }

    public static toggleAddClassesDialog(shouldShow: boolean) {
        facultyLoading.classesTabState.addClassDialogState.isShowing = shouldShow;
        if (shouldShow) {
            this.getCourses();
        } else {
            facultyLoading.classesTabState.addClassDialogState.resetAndClose();
        }
    }

    public static addClassToForm() {
        const {
            classesTabState: {
                addClassDialogState: formState,
                addClassesDrawerState,
            },
        } = facultyLoading;
        const { form: classScheduleChildForm } = formState;

        const {
            form: { classSchedules },
        } = addClassesDrawerState;

        classSchedules.push(
            new FormClassSchedule({
                meetingDays: classScheduleChildForm.meetingDays,
                meetingHours: classScheduleChildForm.meetingHours,
                room: classScheduleChildForm.room,
                section: classScheduleChildForm.section,
                course: classScheduleChildForm.course,
                studentYear: classScheduleChildForm.studentYear,
                forAdjunct: classScheduleChildForm.forAdjunct,
            })
        );

        formState.resetAndClose();
    }

    public static submitClasses() {
        const {
            addClassesDrawerState: formState,
        } = facultyLoading.classesTabState;
        const { form } = formState;

        form.classSchedules.forEach(c => delete c.id);
        formState.setStatus(FormStatus.Submitting);

        const term = facultyLoading.activeTermId!;

        FacultyLoadingService.addClassSchedules(term, form)
            .then(css => {
                css.forEach(cs =>
                    facultyLoading.classesTabState.classSchedules!.set(
                        cs.id,
                        cs
                    )
                );
                formState.resetAndClose();
                formState.activeStep = 0;
            })
            .catch(e => {
                formState.setStatus(FormStatus.Error, e);
            });
    }

    public static getUnderloadedLastTerm() {
        const { classesTabState } = facultyLoading;

        FacultyLoadingService.getUnderloadedLastTerm().then(underloaded => {
            classesTabState.underloadedLastTerm = underloaded;
        });
    }

    public static getYear(year: number) {
        const { classesTabState } = facultyLoading;
        classesTabState.setStatus(FetchableStatus.Fetching);

        FacultyLoadingService.getYear(year).then(years => {
            facultyLoading.year = years.map((t: any) => new Term(t));
            classesTabState.setStatus(FetchableStatus.Fetched);
        });
    }

    public static resetFormClasses() {
        const {
            classesTabState: { addClassesDrawerState },
        } = facultyLoading;
        const { form } = addClassesDrawerState;
        form.resetClasses();
    }

    public static toggleAssignAdjunctDialog(shouldShow: boolean) {
        const {
            classesTabState: { assignAdjunctDialogState },
        } = facultyLoading;
        assignAdjunctDialogState.isShowing = shouldShow;
        if (shouldShow) {
            this.getAdjunctNames();
        } else {
            assignAdjunctDialogState.resetAndClose();
        }
    }

    public static getAdjunctNames() {
        const { classesTabState } = facultyLoading;
        FacultyLoadingService.getAdjunctNames().then(
            an => (classesTabState.adjunctNames = an)
        );
    }

    public static getCourses() {
        const { classesTabState } = facultyLoading;
        FacultyLoadingService.getCourses().then(
            c => (classesTabState.courses = c)
        );
    }

    public static togglePrintOverview(shouldShow: boolean) {
        const { overviewPrintDialogState } = facultyLoading;
        overviewPrintDialogState.isShowing = shouldShow;
    }
}
