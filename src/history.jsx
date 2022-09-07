import ForgeUI, { render, IssueActivity, Text, useState, useProductContext, User, Fragment, Code, DateLozenge, Badge } from "@forge/ui";
import { properties } from '@forge/api';

const App = () => {
    const context = useProductContext();
    const issueKey = context.platformContext.issueKey;
    let [conanHistory, setConanHistory] = useState(async () => await properties.onJiraIssue(issueKey).get('conan-history'));
    console.log(conanHistory);
    return <Fragment>
        {conanHistory !== undefined && conanHistory.reverse().map(history =>
            <Fragment>
                {history.action == 'added' &&
                    <Text>
                        <User accountId={history.user} /> <Badge appearance="added" text={history.action} /> at <Badge text={history.time} />
                    </Text>}
                {history.action == 'deleted' &&
                    <Text>
                        <User accountId={history.user} /> <Badge appearance="removed" text={history.action} /> at <Badge text={history.time} />
                    </Text>}
                {history.action == 'updated' &&
                    <Text>
                        <User accountId={history.user} /> <Badge appearance="primary" text={history.action} /> at <Badge text={history.time} />
                    </Text>}

                <Code text={JSON.stringify(history.object)} language="json" />

                {history.action == 'updated' && (
                    <Fragment>
                        <Text> Old value</Text>
                        <Code text={JSON.stringify(history.oldObject)} language="json" />
                    </Fragment>
                )
                }
            </Fragment>
        )}
    </Fragment>
};

export const run = render(
    <IssueActivity>
        <App />
    </IssueActivity>
);