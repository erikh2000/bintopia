enum ConversationState {
  INITIALIZING,
  IDLE,
  USER_SPEAKING,
  ASSISTANT_SPEAKING,
  PAUSED,
  FATAL_ERROR
}

export default ConversationState;