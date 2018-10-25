import { inject, observer } from "mobx-react";
import * as React from "react";
import EmptyState from "../../components/reusable/EmptyState";
import StateWrapper from "../../components/reusable/StateWrapper";
import FacultyLoadingController from "../../controllers/faculty_loading";
import { FacultyLoadingState } from "../../store/faculty_loading";
import LoadingDetail from "./components/LoadingDetail";

interface IPropsType {
    facultyLoading?: FacultyLoadingState;
}

@inject("facultyLoading")
@observer
export default class FacultyLoading extends React.Component<IPropsType> {
    public componentDidMount() {
        document.title = "Faculty Loading - Falcon";
        FacultyLoadingController.getAllTerms();
    }

    public addTermFormToggle = (shouldShow: boolean) => () => {
        FacultyLoadingController.toggleAddTermForm(shouldShow);
    };

    public render() {
        const { facultyLoading } = this.props;
        const { terms } = facultyLoading!;
        return (
            <StateWrapper
                fetchableState={facultyLoading!.fetchStatus}
                disableFlex
            >
                {() => {
                    return terms!.size === 0 ? (
                        <EmptyState
                            title="Faculty Loading"
                            description="Add classes and schedule faculty members."
                            addButton="Add Term"
                            onButtonClick={this.addTermFormToggle(true)}
                        />
                    ) : (
                        <LoadingDetail />
                    );
                }}
            </StateWrapper>
        );
    }
}
