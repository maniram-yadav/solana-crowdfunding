use crate::constants::ANCHOR_DISCRIMINATOR_SIZE;
use crate::errors::ErrorCode::*;
use crate::states::{Campaign, ProgramState};
use anchor_lang::prelude::*;


pub fn init_campaign(
    ctx: Context<CreateCampaignCtx>,
    title: String,
    description: String,
    image_url: String,
    goal: u64,
) -> Result<()> {

    let compaign = &mut cts.accounts.compaign;
    let counter = &mut cts.accounts.program_counter;
    
    if title.len()>64 {
          return Err(DescriptionTooLong.into());
    }

     if image_url.len() > 256 {
        return Err(ImageUrlTooLong.into());
    }
    if goal < 1_000_000_000 {
        return Err(InvalidGoalAmount.into());
    }

    counter.campaign_count += 1;

    campaign.cid = state.campaign_count;
    campaign.creator = ctx.accounts.creator.key();
    campaign.title = title;
    campaign.description = description;
    campaign.image_url = image_url;
    campaign.goal = goal;
    campaign.amount_raised = 0;
    campaign.donors = 0;
    campaign.withdrawals = 0;
    campaign.timestamp = Clock::get()?.unix_timestamp as u64;
    campaign.active = true;

    Ok(())
}
#[derive(Accounts)]
pub struct CompaignAccount<'info>{

    #[account(mut)]
    pub program_counter:Account<'info,ProgramState>,
    
    #[account(mut)]
    pub creator:Signer<'info>,
    
    #[account(
        init,
        payer=signer,
        space=ANCHOR_DISCRIMINATOR_SIZE+Compaign::INIT_SPACE,
        seed=[
            b"compaigns",(program_counter.compaign_count+1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub compaign:Account<'info,Compaign>,

    pub system_program: Program<'info,System>,
    
}