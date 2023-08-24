import { GoHighLevelContact } from "../GoHighLevel/models/GoHighLevelContact";
import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";

export const dentistVirtualAssistantConfig = VirtualAssistantConfiguration.fromJson({
  goHighLevelAPIKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjhPU3ZYZk5xcXNDaXpHV1JVZE9aIiwiY29tcGFueV9pZCI6IkF4bk9QN2NCRFJzWnFDbkZ1RWROIiwidmVyc2lvbiI6MSwiaWF0IjoxNjkwNjU1ODg5MzU4LCJzdWIiOiJ1c2VyX2lkIn0.6NWHbUTTsgfWFMyTsDW7sKiy5eybPFLGw7CLoWSV1-I',
  lexBotAliasArn: 'arn:aws:lex:us-west-2:263387561161:bot-alias/FROMSU2CCY/S0NUCHC9PK',
  mediaFilesBucketName: 'convertx-mediafiles-convertxdental',
  businessContextForOpenAI: 'You are a virtual receptionist for ConvertX Dental',
  welcomeAudioFileName: 'Welcome.wav',
  goodbyeAudioFileName: 'Goodbye.wav',
  fallbackAudioFileName: 'Fallback.wav',
  subsequentAudioFileName: 'Subsequent.wav',
  continuationAudioFileName: 'Continuation.wav',
  callStartGoHighLevelActions: [
    {
      slotValue: '',
      actionType: 'CreateOpportunity',
      actionData: {
        workflowId: '',
        pipelineId: 'CCqPjEEgyARbORomS1o0',
        stageId: 'e9316e60-518c-4d94-b74f-e1deff289a8e',
      }
    },
  ],
  callEndGoHighLevelActions: [
    {
      slotValue: '',
      actionType: 'CreateOpportunity',
      actionData: {
        workflowId: '',
        pipelineId: 'CCqPjEEgyARbORomS1o0',
        stageId: 'e9316e60-518c-4d94-b74f-e1deff289a8e',
      }
    },
  ],
  intents: [
    {
      matchString: 'Dental Emergency',
      confirmationAudioFileName: 'Confirmation-DentalEmergency.wav',
      fulfillmentAudioFileName: 'Fulfillment-DentalEmergency.wav',
      failedAudioFileName: 'Failed-DentalEmergency.wav',
      goHighLevelActions: [],
      slots: [
        {
          intent: 'DentalEmergencyTextConfirmationIntent',
          name: 'DentalEmergencyTextConfirmation',
          type: 'AMAZON.Confirmation',
          promptAudioFile: 'Prompt-DentalEmergencyTextConfirmation.wav',
          goHighLevelActions: [
            {
              slotValue: 'yes',
              actionType: 'TriggerWorkflow',
              actionData: {
                workflowId: 'e4eb327b-fa15-4540-b43e-255110532426',
              }
            },
          ]
        },
      ]
    },
    {
      matchString: 'Request Appointment',
      confirmationAudioFileName: 'Confirmation-RequestAppointment.wav',
      fulfillmentAudioFileName: 'Fulfillment-RequestAppointment.wav',
      failedAudioFileName: 'Failed-RequestAppointment.wav',
      goHighLevelActions: [
        {
          slotValue: '',
          actionType: 'CreateOpportunity',
          actionData: {
            workflowId: '',
            pipelineId: 'oHririVno2ryZYxg1pTs',
            stageId: '55a74a65-a1df-4b2d-9cae-cd7851782805',
          }
        },
      ],
      slots: [
        {
          intent: 'RequestAppointmentFirstNameIntent',
          name: 'RequestAppointmentFirstName',
          type: 'AMAZON.FirstName',
          promptAudioFile: 'Prompt-RequestAppointmentFirstName.wav',
          goHighLevelActions: [],
        },
        {
          intent: 'RequestAppointmentLastNameIntent',
          name: 'RequestAppointmentLastName',
          type: 'AMAZON.LastName',
          promptAudioFile: 'Prompt-RequestAppointmentLastName.wav',
          goHighLevelActions: [],
        },
        {
          intent: 'RequestAppointmentPurposeIntent',
          name: 'RequestAppointmentPurpose',
          type: 'AMAZON.FreeFormInput',
          promptAudioFile: 'Prompt-RequestAppointmentPurpose.wav',
          goHighLevelActions: [],
        },
      ]
    },
    {
      matchString: 'Clinic Details',
      confirmationAudioFileName: 'Confirmation-ClinicDetails.wav',
      fulfillmentAudioFileName: 'Fulfillment-ClinicDetails.wav',
      failedAudioFileName: 'Failed-ClinicDetails.wav',
      goHighLevelActions: [],
      slots: [
        {
          intent: 'ClinicDetailsTextConfirmationIntent',
          name: 'ClinicDetailsTextConfirmation',
          type: 'AMAZON.Confirmation',
          promptAudioFile: 'Prompt-ClinicDetailsTextConfirmation.wav',
          goHighLevelActions: [
            {
              slotValue: 'yes',
              actionType: 'TriggerWorkflow',
              actionData: {
                workflowId: 'e99010bb-601d-485f-831b-2b638a8e4e9a',
              }
            },
          ],
        },
      ]
    },
    {
      matchString: 'Leave a message',
      confirmationAudioFileName: 'Confirmation-Voicemail.wav',
      fulfillmentAudioFileName: 'Fulfillment-Voicemail.wav',
      failedAudioFileName: 'Failed-Voicemail.wav',
      goHighLevelActions: [
      ],
      slots: [
        {
          intent: 'VoicemailMessageIntent',
          name: 'VoicemailMessage',
          type: 'AMAZON.FreeFormInput',
          promptAudioFile: 'Prompt-VoicemailMessage.wav',
          goHighLevelActions: [
            {
              slotValue: '',
              actionType: 'CreateTask',
              actionData: {
                pipelineId: 'CCqPjEEgyARbORomS1o0',
                stageId: 'e9316e60-518c-4d94-b74f-e1deff289a8e',
              },
            }
          ],    
        }
      ]
    },
  ]
});

export const goHighLevelContact = GoHighLevelContact.fromJson({
  id: 'goHighLevelContactId',
  phone: '+12345678910',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
});
