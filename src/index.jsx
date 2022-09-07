import ForgeUI, { render, Fragment, Text, IssuePanel, TextField, Form, Link, useProductContext, useState, Table, Head, Row, Cell, Button, ButtonSet } from '@forge/ui';
import { properties } from '@forge/api';
const App = () => {
  const context = useProductContext();
  const issueKey = context.platformContext.issueKey;

  let [conanIntergration, setConanIntergration] = useState(async () => await properties.onJiraIssue(issueKey).get('conan-integration'));
  let [conanHistory] = useState(async () => await properties.onJiraIssue(issueKey).get('conan-history'));


  // init data
  if (conanIntergration == undefined) {
    conanIntergration = {
      data: [],
      lastId: 0
    }
    properties.onJiraIssue(issueKey).set('conan-integration', conanIntergration);
  }
  // end init data

  let [selectedConan, setSelectedConan] = useState({ name: "", url: "" });
  let [actionForm, setActionForm] = useState("Add")
  const pushHistory = async (history) => {
    conanHistory = await properties.onJiraIssue(issueKey).get('conan-history');
    if (conanHistory == undefined) {
      conanHistory = []
    }
    conanHistory.push(history);
    await properties.onJiraIssue(issueKey).set('conan-history', conanHistory);
  }
  const onSubmit = async (formData) => {
    conanIntergration = await properties.onJiraIssue(issueKey).get('conan-integration');
    if (actionForm === 'Add') {
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
    }
    if (actionForm === 'Update') {
      conanIntergration.data = conanIntergration.data.map(item => {
        if (item !== null && item.id === selectedConan.id) {
          item.name = formData.name;
          item.url = formData.url;
        }
        return item;
      })
      console.log('Updating....q');
      console.log(conanIntergration);
      formData.id = selectedConan.id;
      await properties.onJiraIssue(issueKey).set('conan-integration', conanIntergration);
      setConanIntergration(conanIntergration);
      let history = {
        action: 'updated',
        user: context.accountId,
        object: formData,
        oldObject: selectedConan,
        time: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      }
      await pushHistory(history);
      setActionForm("Add");
      setSelectedConan({name:"",url:""});
    }

  };
  let onEdit = (conan) => {
    console.log('edit');
    console.log(conan);
    setActionForm("Update")
    setSelectedConan({ name: conan.name, url: conan.url, id: conan.id });
  }
  let onDelete = async (conan) => {
    console.log('delete');
    conanIntergration = await properties.onJiraIssue(issueKey).get('conan-integration');
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
  console.log(conanIntergration);
  return (
    <Fragment>
      <Form onSubmit={onSubmit} submitButtonText={actionForm}>
        <Table>
          <Row>
            <Cell>
              <TextField defaultValue={selectedConan.name} isRequired="true" label="Name" name="name" />
            </Cell>
            <Cell>
              <TextField defaultValue={selectedConan.url} isRequired="true" label="URL" name="url" />
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
            conan !== null && <Row>
              <Cell>
                <Text>{conan.name}</Text>
              </Cell>
              <Cell>
                <Text>
                  <Link appearance="link" href={conan.url}>
                    {conan.url}
                  </Link>
                </Text>
              </Cell>
              <Cell>
                <ButtonSet>
                  <Button icon='edit' onClick={
                    async () => {
                      onEdit(conan)
                    }
                  }></Button>
                  <Button icon='trash' onClick={async () => await onDelete(conan)}></Button>
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
