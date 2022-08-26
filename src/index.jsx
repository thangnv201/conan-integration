import ForgeUI, { render, Fragment, Text, IssuePanel, TextField, Form, Code, useProductContext, useState, Table, Head, Row, Cell, Button, ButtonSet } from '@forge/ui';
import { properties } from '@forge/api';
const App = () => {
  const context = useProductContext();
  const issueKey = context.platformContext.issueKey;

  let [conanIntergration, setConanIntergration] = useState(async () => await properties.onJiraIssue(issueKey).get('conan-integration'));
  let [conanHistory, setConanHistory] = useState(async () => await properties.onJiraIssue(issueKey).get('conan-history'));

  // init data
  if (conanIntergration == undefined) {
    conanIntergration = {
      data: [],
      lastId: 0
    }
  }
  // end init data
  const pushHistory = async (history) => {
    conanHistory = await properties.onJiraIssue(issueKey).get('conan-history');
    if (conanHistory == undefined) {
      conanHistory = []
    }
    conanHistory.push(history);
    await properties.onJiraIssue(issueKey).set('conan-history', conanHistory);
  }
  const onSubmit = async (formData) => {

    formData.id = conanIntergration.lastId + 1;
    conanIntergration.data.push(formData);
    conanIntergration.lastId = formData.id;
    await properties.onJiraIssue(issueKey).set('conan-integration', conanIntergration);
    setConanIntergration(conanIntergration);
    let history = {
      action: 'added',
      user: context.accountId,
      object: formData,
      time: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    }
    await pushHistory(history);
  };
  let onEdit = (conan) => {
    console.log('edit');
    console.log(conan);

  }
  let onDelete = async (conan) => {
    console.log('delete');
    let afterRemoveConanIntergration = conanIntergration.data.filter(item => item.id != conan.id);
    conanIntergration.data = afterRemoveConanIntergration;
    await properties.onJiraIssue(issueKey).set('conan-integration', conanIntergration);
    setConanIntergration(conanIntergration);
    let history = {
      action: 'deleted',
      user: context.accountId,
      object: conan,
      time: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    }
    await pushHistory(history);
  }

  return (
    <Fragment>
      <Form onSubmit={onSubmit} submitButtonText="Add">
        <Table>
          <Row>
            <Cell>
              <TextField label="Name" name="name" />
            </Cell>
            <Cell>
              <TextField label="URL" name="url" />
            </Cell>
          </Row>
        </Table>
      </Form>
      {conanIntergration.data.length !== 0 && conanIntergration !== undefined && <Table>
        <Head>
          <Cell>
            <Text>Name</Text>
          </Cell>
          <Cell>
            <Text>Url</Text>
          </Cell>
          <Cell>
            <Text>Action</Text>
          </Cell>
        </Head>
        {
          conanIntergration.data.map(conan => (
            <Row>
              <Cell>
                <Text>{conan.name}</Text>
              </Cell>
              <Cell>
                <Text>{conan.url}</Text>
              </Cell>
              <Cell>
                <ButtonSet>
                  <Button icon='edit' onClick={
                    async () => {
                      onEdit(conan)
                    }
                  }></Button>
                  <Button icon='trash' onClick={async()=> await onDelete(conan)}></Button>
                </ButtonSet>

              </Cell>
            </Row>
          ))
        }
      </Table>}
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
