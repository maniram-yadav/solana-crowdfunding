/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fundus.json`.
 */
export type Fundus = {
  "address": "8tfuvG2FVPUE41keGjgybaftAiw9UQBK3FGtYxMyzJ5W",
  "metadata": {
    "name": "fundus",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solana Crowd Funding"
  },
  "instructions": [],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "Th program has already been initialied."
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "Title exceeds the maximum length of 64 characters."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description exceeds the maximum length of 512 characters."
    },
    {
      "code": 6003,
      "name": "imageUrlTooLong",
      "msg": "Image URL exceeds the maximum length of 256 characters."
    },
    {
      "code": 6004,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount. Goal must be greater than zero."
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized access."
    },
    {
      "code": 6006,
      "name": "campaignNotFound",
      "msg": "Campaign not found."
    },
    {
      "code": 6007,
      "name": "inactiveCampaign",
      "msg": "Campaign is inactive."
    },
    {
      "code": 6008,
      "name": "invalidDonationAmount",
      "msg": "Donation amount must be at least 1 SOL."
    },
    {
      "code": 6009,
      "name": "campaignGoalActualized",
      "msg": "Campaign goal reached."
    },
    {
      "code": 6010,
      "name": "invalidWithdrawalAmount",
      "msg": "Withdrawal amount must be at least 1 SOL."
    },
    {
      "code": 6011,
      "name": "insufficientFund",
      "msg": "Insufficient funds in the campaign."
    },
    {
      "code": 6012,
      "name": "invalidPlatformAddress",
      "msg": "The provided platform address is invalid."
    },
    {
      "code": 6013,
      "name": "invalidPlatformFee",
      "msg": "Invalid platform fee percentage."
    }
  ]
};
