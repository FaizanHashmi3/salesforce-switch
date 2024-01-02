
const express = require('express');
const cors = require('cors'); 
const axios = require('axios');
const path = require("path");
const https = require('https');
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
app.use(express.static(path.resolve(__dirname, "switch", "build")));
res.sendFile(path.resolve(__dirname, "switch", "build", "index.html"));
});


var token = '';
var url = " ";

const clientId = '3MVG95mg0lk4batjVwHpPkahCROA1JXckG2MoWXqDTqMcv2sI4NjLmzIJq33BJka_FCR0TwINW3LN.Yuclvxa';
const clientSecret = '4296A62A96D50C0A3B928A183176446BF37CE71B889293DE61607C9BD34E2AE0';
const redirectUri = 'https://salesforce-switch.vercel.app'; 

const salesforceAPI = 'https://cheems6-dev-ed.develop.my.salesforce.com/services/data/v33.0/tooling/sobjects/ValidationRule/';

app.get('/oauth2/callback', async (req, res) => {
  const { code } = req.query;

  // const tokenUrl = 'https://cheems6-dev-ed.develop.my.salesforce.com/services/oauth2/token'; 
  const tokenUrl = 'https://login.salesforce.com/services/oauth2/token'; 

  const requestBody = {
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  };

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams(requestBody).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    const instanceUrl = response.data.instance_url;
    console.log("accestoken neeche")
    console.log(accessToken)
    console.log("instance hai ye")
    console.log(instanceUrl);
    url = instanceUrl;
    // console.log("accsstkn> " + accessToken);
    token = accessToken;
    // console.log(token);
   
    let username = await getSalesforceUsername(accessToken,instanceUrl);
    console.log("username aaya")
    console.log(username)
    const data={
      accessToken,
      username
    }
    // res.json({ accessToken});
    res.json(data);
  } catch (error) {
    console.error('Error fetching access token: backend', error);
    res.status(500).send('Error fetching access token');
  }
});


/********************************************************* */
async function getSalesforceUsername(accessToken,instanceUrl) {
  try {
    const response = await axios.get(`${instanceUrl}/services/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    // console.log("response.data")
      // console.log(response.data)
    return response.data.name;
  } catch (error) {
    console.error('Error fetching username:', error);
    throw error; // Re-throw to allow for further handling
  }
}

/*************************************************************** */

// Handle GET request to fetch validation rules
app.get('/getValidationRules', async (req, res) => {
  const accessToken = token; 

  const instanceUrl = url; 

  const queryUrl = `${instanceUrl}/services/data/v33.0/tooling/query/?q=Select+id,FullName,TableEnumOrId,ValidationName,Metadata+from+ValidationRule`;

  try {
    const response = await axios.get(queryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const validationRules = response.data; 
    // console.log("neeche");
    // console.log(response.data);
    res.json(validationRules);
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    res.status(500).send('Error fetching validation rules');
  }
});







// Route to toggle validation rule status
app.put('/toggleValidationRule/:ruleId', async (req, res) => {
  const { ruleId } = req.params;
  const { newStatus } = req.body; 
  const { formula } = req.body; 
  const { errormsg } = req.body; 
  

  const accessToken = token; 
  console.log(newStatus);
  console.log(ruleId);
  console.log(formula);
  console.log(errormsg);
  

  try {
   
    const updatedRule = await udateValidationRuleStatus(ruleId, newStatus, accessToken, formula, errormsg);
    
    console.log("updatedRule");
    console.log(updatedRule);
    res.json({ updatedRule });
  } catch (error) {
    console.error('Error updating validation rule status:', error);
    res.status(500).send('Error updating validation rule status');
  }
});
/************************************************************************************* */

async function udateValidationRuleStatus (ruleId, newStatus, accessToken, formula, errormsg){
  const instanceUrl = url; 
  const updateUrl = `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`;
  
  const body = JSON.stringify({
  
    Metadata: {
      active:newStatus,
      errorConditionFormula: `${formula}`, 
      errorMessage:`${errormsg}`
  
    }
  }); 

  try {
    const response = await axios.patch(updateUrl, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    
    return response.data;
  } catch (error) {
    throw new Error(`Error updating validation rule status: ${error}`);
  }
};




/* ************************************************************************************** */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

