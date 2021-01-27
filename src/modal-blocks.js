const categories = [
  {
    value: "teamwork",
    text: "Teamwork",
  },
  {
    value: "mastery",
    text: "Mastery",
  },
  {
    value: "problemSolved",
    text: "Problem solved",
  },
  {
    value: "awesomeWork",
    text: "Awesome work",
  },
  {
    value: "thankYou",
    text: "Thank you",
  },
  {
    value: "congratulations",
    text: "Congratulations",
  },
  {
    value: "momentsThatMatter",
    text: "Moments that matter",
  },
];

const categoryBlockOptions = categories.map((category) => ({
  text: {
    type: "plain_text",
    text: category.text,
  },
  value: category.value,
}));

const getModalBlocks = (kudosText) => {
  const kudosTextBlock = {
    block_id: "kudos_text_block",
    type: "input",
    label: {
      type: "plain_text",
      text: "Kudos text:",
    },
    element: {
      action_id: "kudos_text",
      type: "plain_text_input",
      initial_value: kudosText,
      multiline: true,
    },
  };

  const categoryBlock = {
    block_id: "category_block",
    type: "input",
    label: {
      type: "plain_text",
      text: "Category:",
    },
    element: {
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "Select category",
      },
      options: categoryBlockOptions,
      action_id: "static_select-action",
    },
  };

  const recipientBlock = {
    block_id: "recipient_block",
    type: "input",
    label: {
      type: "plain_text",
      text: "Send to user:",
    },
    element: {
      action_id: "recipient",
      type: "users_select",
      placeholder: {
        type: "plain_text",
        text: "Select user",
      },
    },
  };

  return [kudosTextBlock, categoryBlock, recipientBlock];
};

module.exports = getModalBlocks;
