use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
#[allow(unused_imports)]
use states::*;

// Program ID declaration (replace with your own ID when deploying)
declare_id!("8tfuvG2FVPUE41keGjgybaftAiw9UQBK3FGtYxMyzJ5W");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn initialize(ctx: Context<InitializeContext>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_campaign(
        ctx: Context<CampaignAccount>,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        instructions::init_campaign(ctx, title, description, image_url, goal)
    }

    pub fn update_campaign(
        ctx: Context<UpdateCampaignContext>,
        cid: u64,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        instructions::update_campaign(ctx, cid, title, description, image_url, goal)
    }

    pub fn delete_campaign(ctx: Context<DeleteCampaignContext>, cid: u64) -> Result<()> {
        instructions::delete_campaign(ctx, cid)
    }

    pub fn donate(ctx: Context<DonateContext>, cid: u64, amount: u64) -> Result<()> {
        instructions::donate(ctx, cid, amount)
    }

    pub fn withdraw(ctx: Context<WithdrawContext>, cid: u64, amount: u64) -> Result<()> {
        instructions::withdraw(ctx, cid, amount)
    }

    pub fn update_platform_settings(
        ctx: Context<UpdateSettingsContext>,
        new_platform_fee: u64,
    ) -> Result<()> {
        instructions::update_platform_settings(ctx, new_platform_fee)
    }
}
