/**
 * OpenCode Transport Handler
 *
 * OpenCode-specific implementation of TransportHandler.
 * OpenCode CLI implements the ACP protocol cleanly and doesn't require
 * special stdout filtering, but benefits from a longer init timeout.
 *
 * @module OpenCodeTransport
 */

import { DefaultTransport } from '../DefaultTransport';

/**
 * OpenCode-specific timeout values (in milliseconds)
 */
export const OPENCODE_TIMEOUTS = {
  /** OpenCode CLI can take a moment to start up */
  init: 60_000,
  /** Standard tool call timeout */
  toolCall: 120_000,
  /** Investigation tools can run for a long time */
  investigation: 600_000,
  /** Think tools are usually quick */
  think: 30_000,
  /** Idle detection after last message chunk */
  idle: 500,
} as const;

/**
 * OpenCode transport handler.
 *
 * OpenCode follows the ACP protocol closely so DefaultTransport
 * behaviour is mostly sufficient. This class pins the agentName
 * and can be extended with opencode-specific quirks as they are discovered.
 */
export class OpenCodeTransport extends DefaultTransport {
  constructor() {
    super('opencode');
  }

  /**
   * OpenCode init timeout
   */
  getInitTimeout(): number {
    return OPENCODE_TIMEOUTS.init;
  }

  /**
   * Get idle detection timeout
   */
  getIdleTimeout(): number {
    return OPENCODE_TIMEOUTS.idle;
  }
}

/**
 * Singleton instance for convenience
 */
export const openCodeTransport = new OpenCodeTransport();
