import { ChainApiClient } from "@sao-js-sdk/api-client";
import {
  BuildCreateReqParams,
  BuildLoadReqParams,
  BuildNodeAddressReqParams,
  BuildUpdateReqParams,
  BuildModelDeleteReqParams,
  BuildModelRenewOrderReqParams,
  BuildModelUpdatePermissionReqParams,
  CreateRequestClient,
  SaoNodeAPISchema,
  ClientOrderProposal,
  QueryMetadataProposal,
  SaoTypes,
  UpdatePermissionProposal,
  OrderRenewProposal,
  OrderTerminateProposal,
} from "@sao-js-sdk/api-client";

export class Model {
  dataId: string;
  alias: string;
  commitId?: string;
  version?: string;
  content?: number[];
  cid?: string;
  tags?: string[];
  rule?: string;
  extendInfo?: string;

  constructor(dataId: string, alias: string) {
    this.dataId = dataId;
    this.alias = alias;
  }

  setCommitId(commitId: string) {
    this.commitId = commitId;
  }

  setVersion(version: string) {
    this.version = version;
  }

  setContent(content: number[]) {
    this.content = content;
  }

  setCid(cid: string) {
    this.cid = cid;
  }

  setTags(tags: string[]) {
    this.tags = [...tags];
  }

  setRule(rule: string) {
    this.rule = rule;
  }

  setExtendInfo(extendInfo: string) {
    this.extendInfo = extendInfo;
  }

  cast(): any {
    return JSON.parse(String(this.content));
  }

  toString(): string {
    return JSON.stringify(this);
  }
}

export class ModelProvider {
  private ownerSid: string;
  private groupId: string;
  private nodeAddress: string;
  private nodeApiClient: CreateRequestClient<SaoNodeAPISchema>;
  private chainApiClient: ChainApiClient;

  public constructor(
    ownerSid: string,
    groupId: string,
    nodeApiClient: CreateRequestClient<SaoNodeAPISchema>,
    chainApiClient: ChainApiClient
  ) {
    this.ownerSid = ownerSid;
    this.groupId = groupId;
    this.nodeApiClient = nodeApiClient;
    this.chainApiClient = chainApiClient;
  }

  async init() {
    const res = await this.nodeApiClient.jsonRpcApi(BuildNodeAddressReqParams());
    this.nodeAddress = res.data.result;
  }

  getOwnerSid(): string {
    return this.ownerSid;
  }

  getGroupId(): string {
    return this.groupId;
  }

  getNodeAddress(): string {
    return this.nodeAddress;
  }

  validate(proposal: SaoTypes.Proposal): boolean {
    return proposal.groupId === this.groupId && proposal.owner === this.ownerSid;
  }

  async getLatestHeight(): Promise<number> {
    return await this.chainApiClient.GetLatestBlockHeight();
  }

  async getPeerInfo(): Promise<string> {
    return await this.chainApiClient.GetNodePeerInfo(this.nodeAddress);
  }

  async create(
    query: QueryMetadataProposal,
    clientProposal: ClientOrderProposal,
    orderId: number,
    content: number[]
  ): Promise<Model> {
    const res = await this.nodeApiClient.jsonRpcApi(BuildCreateReqParams(query, clientProposal, orderId, content));

    if (res.data.result) {
      const model = new Model(res.data.result.DataId, res.data.result.Alias);
      model.setCid(res.data.result.Cid);

      return model;
    } else if (res.data.error) {
      throw new Error(res.data.error.message);
    } else {
      throw new Error("unknown error");
    }
  }

  async update(
    query: QueryMetadataProposal,
    clientProposal: ClientOrderProposal,
    orderId: number,
    patch: number[]
  ): Promise<Model> {
    const res = await this.nodeApiClient.jsonRpcApi(BuildUpdateReqParams(query, clientProposal, orderId, patch));
    if (res.data.result) {
      const model = new Model(res.data.result.DataId, res.data.result.Alias);
      model.setCid(res.data.result.Cid);

      return model;
    } else if (res.data.error) {
      throw new Error(res.data.error.message);
    } else {
      throw new Error("unknown error");
    }
  }

  async store(request: ClientOrderProposal): Promise<number> {
    const txResult = await this.chainApiClient.Store(request);
    if (txResult.code != 0) {
      throw new Error(`store failed, DataId: ${request.Proposal.dataId}`);
    } else {
      const res = await this.chainApiClient.GetTx(txResult.transactionHash);

      if (res.status === 200) {
        const resp = await this.chainApiClient.DecodeOrderId(res.data.tx_response.data);

        return resp.orderId;
      } else {
        throw new Error(`store failed. ${res.statusText}`);
      }
    }
  }

  async load(query: QueryMetadataProposal): Promise<Model> {
    const res = await this.nodeApiClient.jsonRpcApi(BuildLoadReqParams(query));

    if (res.data.result) {
      const model = new Model(res.data.result.DataId, res.data.result.Alias);
      model.setCid(res.data.result.Cid);
      model.setContent(res.data.result.Content);
      model.setCommitId(res.data.result.CommitId);
      model.setVersion(res.data.result.Version);

      return model;
    } else if (res.data.error) {
      throw new Error(res.data.error.message);
    } else {
      throw new Error("unknown error");
    }
  }

  async updatePermission(request: UpdatePermissionProposal, isPublish: boolean): Promise<void> {
    if (isPublish) {
      const txResult = await this.chainApiClient.UpdatePermission(request);
      if (txResult.code != 0) {
        throw new Error(`update permission failed failed, DataId: ${request.Proposal.dataId}`);
      } else {
        return;
      }
    } else {
      const res = await this.nodeApiClient.jsonRpcApi(BuildModelUpdatePermissionReqParams(request));
      if (res.data.result) {
        return;
      } else if (res.data.error) {
        throw new Error(res.data.error.message);
      } else {
        throw new Error("unknown error");
      }
    }
  }

  async renew(request: OrderRenewProposal, isPublish: boolean): Promise<void> {
    if (isPublish) {
      const txResult = await this.chainApiClient.Renew(request);
      if (txResult.code != 0) {
        throw new Error(`renew failed, DataIds: ${request.Proposal.data}`);
      } else {
        return;
      }
    } else {
      const res = await this.nodeApiClient.jsonRpcApi(BuildModelRenewOrderReqParams(request));
      if (res.data.result) {
        return;
      } else if (res.data.error) {
        throw new Error(res.data.error.message);
      } else {
        throw new Error("unknown error");
      }
    }
  }

  async terminate(request: OrderTerminateProposal, isPublish: boolean): Promise<void> {
    if (isPublish) {
      const txResult = await this.chainApiClient.Terminate(request);
      if (txResult.code != 0) {
        throw new Error(`terminate failed, DataIds: ${request.Proposal.dataId}`);
      } else {
        return;
      }
    } else {
      const res = await this.nodeApiClient.jsonRpcApi(BuildModelDeleteReqParams(request));
      if (res.data.result) {
        return;
      } else if (res.data.error) {
        throw new Error(res.data.error.message);
      } else {
        throw new Error("unknown error");
      }
    }
  }
}

export * from "./manager";
export * from "./types";
