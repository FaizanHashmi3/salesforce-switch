

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import './App.css';
import Loader from './Loader';

const App = () => {
  const [accessToken, setAccessToken] = useState('');
  const [validationRules, setValidationRules] = useState([]);
  const [isToggled, setIsToggled] = useState(false);
  const [metaButton, setMetaButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [able, setAble] = useState(false);
  const [name,setName] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      fetchAccessToken(code);
    }
  }, []);

  const fetchAccessToken = async (code) => {

    try {
      setIsLoading(true);
      console.log("authCode>> " + code);
      const response = await axios.get(`${window.location.origin}/oauth2/callback?code=${code}`);
      const  accessToken  = await response.data.accessToken;
      const username  = await response.data.username;
      setName(username);
      // console.log("response.data");
      // console.log(accessToken);
      // console.log(username);
      // console.log(response.data);

      setAccessToken(accessToken);
      setIsLoading(false);
      // fetchValidationRules();
      // console.log("acessTknfrnt>> "+access_token);
      // console.log("resdata>> "+response.data);
    } catch (error) {
      console.error('Error fetching access token: Frontend', error);
    }
  };



  const fetchValidationRules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${window.location.origin}/getValidationRules`, {
        headers: {
          Authorization: `Bearer ${ accessToken }`,
        },
        
  });
  
  // console.log(response.data.records);
  setValidationRules(response.data.records);
  setMetaButton(false);
  setIsLoading(false);
  
} catch (error) {
  console.error('Error fetching validation rules:frontend', error);
}
  };

const handleSalesforceAuth = () => {
  setIsLoading(true)
  const clientId = '3MVG95mg0lk4batjVwHpPkahCROA1JXckG2MoWXqDTqMcv2sI4NjLmzIJq33BJka_FCR0TwINW3LN.Yuclvxa';
  const redirectUri = 'https://salesforce-switch.vercel.app'; 

  const salesforceAuthUrl = `https://login.salesforce.com/services/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

    window.location.href = salesforceAuthUrl;
};
  const handleToggle = async (ruleId, currentStatus,formula,errormsg) => {
    try {
      setIsLoading(true);
      const newStatus = !currentStatus; 
      const response = await axios.put(`${window.location.origin}/toggleValidationRule/${ruleId}`, { newStatus ,formula, errormsg});

      // console.log("response.data.updatedRule");
      console.log(response.data);
      // setValidationRules(response.data.updatedRule); 
      fetchValidationRules();
      setIsToggled(!isToggled);
      setIsLoading(false);
    } catch (error) {
      console.error('Error toggling validation rule status:', error);
     
    }
  };

function handleDisable()
{
  setAble(true)
  validationRules.forEach(item => {
      handleToggle(item.Id, true,item.Metadata.errorConditionFormula,item.Metadata.errorMessage);
  });
  setAble(false)
  // setIsLoading(false)
}
async function handleEnable()
{
  setAble(true)
  setIsLoading(true)
  validationRules.forEach(item => {
    handleToggle(item.Id, false,item.Metadata.errorConditionFormula,item.Metadata.errorMessage);
});
setAble(false)
// setIsLoading(false)
}






return (
  <div className='App'>
    <div style={{color:"#ff6600",fontSize:"4rem"}}>Salesforce Switch</div>
    {!accessToken ?(
      <div className='login'>
      <h1>Login here and wait for a moment...  </h1>
       <button onClick={handleSalesforceAuth}>Login</button>
   </div>
    ):(metaButton ? (isLoading ? <Loader/> :<div className='meta-page'>
      <h2>Username: {name}</h2>
    <button className='meta-btn' onClick={fetchValidationRules}>Get Metadata</button>
  </div>):( able || isLoading? (<Loader/> ):<div>
    <div>
        <h2>Username: {name}</h2>
        <button className='disable-btn' onClick={()=>handleDisable()}>Disable all</button>
        <button className='enable-btn' onClick={()=>handleEnable()}>Enable all</button>
        
       </div>
    <div>
    <table className='table-body'>
        <tr>
          <th className='th'>Validation Rules</th>
          <th className='th'>Active status</th>
        </tr>
        {validationRules.map((item,key)=>{
          return (<tr key={item.Id}>

                <td>{item.ValidationName}</td>
                <td className='toggle' onClick={()=>{handleToggle(item.Id, item.Metadata.active,item.Metadata.errorConditionFormula,item.Metadata.errorMessage
)}}>{item.Metadata.active?(<FaToggleOn color="green" size={30}/>):
                        (<FaToggleOff color="red" size={30}/>)          
                    }</td>

                  </tr>
          )
        })}
      </table>
    </div>
  </div>)
    )}
    

    

      

   
    
  </div>
);
};

export default App;








