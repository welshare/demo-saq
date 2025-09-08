# The Seattle Angina Questionnaire on Welshare

This is a demo on how you can use plain LLMs and the welshare docs' llms.txt to build questionnaire forms from common panel definitions to submit them to a welshare user profile using the [welshare React SDK](https://www.npmjs.com/package/@welshare/react).

## vibing this with Claude Code

- download some loinc panel and adjust to your needs, we use https://loinc.org/88479-1/ here. Save as a JSON file (eventually remove the bundle wrapper)

- our prompt:

> init an npm repo and create a Nextjs application. It should render a webform for users to answer questions according to the seattle_angina.json Fhir questionnnaire definition.  
> 
> The form data must be submitted in accordance to the QuestionnaireResponse for this specific questionnaire definition. Upon submission the   data should go into the welshare wallet as explained here: https://docs.welshare.app/llms-full.txt.  
>
> The style should look very ugly: it should have a  purple background, green text and input boxes with rounded edges that have a yellow background.

- we had to tell Claude that some things weren't working great.
- get an application id, register the questionniare at welshare, get the questionnaire id, put it down in the .env file. See: https://docs.welshare.app/sdk#configuration-prerequisites

- tell Claude to update the alerts and toasts to not show preliminary errors during the connection phase

- we finally provided Claude with [the paper that explains the SAQ computation](https://www.jacc.org/doi/epdf/10.1016/0735-1097%2894%2900397-9)





