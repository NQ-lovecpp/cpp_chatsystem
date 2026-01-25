/**
 * 好友相关 API
 */

import { httpPostWithSession } from './httpClient';

const API = {
    GET_FRIEND_LIST: '/service/friend/get_friend_list',
    SEARCH_FRIEND: '/service/friend/search_friend',
    ADD_FRIEND_APPLY: '/service/friend/add_friend_apply',
    ADD_FRIEND_PROCESS: '/service/friend/add_friend_process',
    REMOVE_FRIEND: '/service/friend/remove_friend',
    GET_PENDING_EVENTS: '/service/friend/get_pending_friend_events',
};

/**
 * 获取好友列表
 */
export async function getFriendList(sessionId, userId) {
    return httpPostWithSession(API.GET_FRIEND_LIST, {}, sessionId, userId);
}

/**
 * 搜索好友/用户
 */
export async function searchFriend(sessionId, userId, searchKey) {
    return httpPostWithSession(API.SEARCH_FRIEND, { search_key: searchKey }, sessionId, userId);
}

/**
 * 发送好友申请
 */
export async function addFriendApply(sessionId, userId, respondentId) {
    return httpPostWithSession(API.ADD_FRIEND_APPLY, { respondent_id: respondentId }, sessionId, userId);
}

/**
 * 处理好友申请
 */
export async function addFriendProcess(sessionId, userId, applyUserId, agree, notifyEventId = '') {
    return httpPostWithSession(API.ADD_FRIEND_PROCESS, {
        apply_user_id: applyUserId,
        agree,
        notify_event_id: notifyEventId,
    }, sessionId, userId);
}

/**
 * 删除好友
 */
export async function removeFriend(sessionId, userId, peerId) {
    return httpPostWithSession(API.REMOVE_FRIEND, { peer_id: peerId }, sessionId, userId);
}

/**
 * 获取待处理的好友申请
 */
export async function getPendingFriendEvents(sessionId, userId) {
    return httpPostWithSession(API.GET_PENDING_EVENTS, {}, sessionId, userId);
}
