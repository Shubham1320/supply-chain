'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChain extends Contract {

  async InitLedger(ctx) {
    const assets = [
      {
        ID: 'asset1',
        Owner: 'Manufacturer',
        AppraisedValue: 300,
      },
      {
        ID: 'asset2',
        Owner: 'Manufacturer',
        AppraisedValue: 400,
      },
      {
        ID: 'asset3',
        Owner: 'Manufacturer',
        AppraisedValue: 500,
      },
      {
        ID: 'asset4',
        Owner: 'Manufacturer',
        AppraisedValue: 600,
      },
      {
        ID: 'asset5',
        Owner: 'Manufacturer',
        AppraisedValue: 700,
      },
      {
        ID: 'asset6',
        Owner: 'Manufacturer',
        AppraisedValue: 800,
      },
    ];

    for (const asset of assets) {
      asset.docType = 'asset';
      await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
      console.info(`Asset ${asset.ID} initialized`);
    }
  }

  async CreateAsset(ctx, id, owner, appraisedValue) {
    
    const asset = {
        ID: id,
        Owner: owner,
        AppraisedValue: appraisedValue,
    };

    ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    return JSON.stringify(asset);
  }

  async ReadAsset(ctx, id) {
    const assetJSON = await ctx.stub.getState(id); 
      
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }
    
    return assetJSON.toString();
  }

  async TransferAsset(ctx, id, newOwner) {
    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    asset.Owner = newOwner;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }


  async GetAllAssets(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
          
        record = JSON.parse(strValue);
      
      }catch (err) {
        console.log(err);
        record = strValue;
      }
            
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
        
    return JSON.stringify(allResults);
  }  

}

module.exports = SupplyChain;
