// @flow

import { createBatchItem, logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { Chunk } from "./types";

const getContentRangeValue = (chunk, item) => chunk.data ?
	`bytes ${chunk.start}-${chunk.start + chunk.data.size - 1}/${item.file.size}` : "";

export default (
	chunk: Chunk,
	item: BatchItem,
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress,
): SendResult => {

	if (!chunk.data && item.file) {
		//slice the chunk based on bit position
		chunk.data = getChunkDataFromFile(item.file, chunk.start, chunk.end);
	}

	const chunkItem = createBatchItem(chunk.data, chunk.id);

	logger.debugLog(`chunkedSender: about to send chunk ${chunk.id} [${chunk.start}-${chunk.end}] to: ${url}`);

	sendOptions = {
		...sendOptions,
		headers: {
			...sendOptions.headers,
			"Content-Range": getContentRangeValue(chunk, item),
		}
	};

	return send([chunkItem], url, sendOptions, onProgress);
};
