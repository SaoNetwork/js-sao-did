/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "saonetwork.sao.sao";

export interface PaymentProposal {
  orderId: number;
  paymentDid: string;
}

function createBasePaymentProposal(): PaymentProposal {
  return { orderId: 0, paymentDid: "" };
}

export const PaymentProposal = {
  encode(message: PaymentProposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.orderId !== 0) {
      writer.uint32(8).uint64(message.orderId);
    }
    if (message.paymentDid !== "") {
      writer.uint32(18).string(message.paymentDid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PaymentProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePaymentProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderId = longToNumber(reader.uint64() as Long);
          break;
        case 2:
          message.paymentDid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PaymentProposal {
    return {
      orderId: isSet(object.orderId) ? Number(object.orderId) : 0,
      paymentDid: isSet(object.paymentDid) ? String(object.paymentDid) : "",
    };
  },

  toJSON(message: PaymentProposal): unknown {
    const obj: any = {};
    message.orderId !== undefined && (obj.orderId = Math.round(message.orderId));
    message.paymentDid !== undefined && (obj.paymentDid = message.paymentDid);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PaymentProposal>, I>>(object: I): PaymentProposal {
    const message = createBasePaymentProposal();
    message.orderId = object.orderId ?? 0;
    message.paymentDid = object.paymentDid ?? "";
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
