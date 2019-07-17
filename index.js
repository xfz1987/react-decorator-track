/**
 * create by xfz
 */

import _ from 'lodash'
import React from 'react'

/**
 * 计时
 */
const formateTime = (time, type = '-') => {
  const date = new Date(time),
    y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    h = date.getHours(),
    mm = date.getMinutes(),
    s = date.getSeconds();
  
  return `${y}${type}${m<10?'0'+m:m}${type}${d<10?'0'+d:d} ${h<10?'0'+h:h}:${mm<10?'0'+mm:mm}:${s<10?'0'+s:s}`;
}

/**
 * 通过state和schema 组装trackData
 */
const createTrackData = (data, schema) => {
  for (let key of Object.keys(schema)) {
    if (!schema[key]) {
      schema[key] = data[key]
    }
  }
  return schema
}

const TRACK_LIFE_ACTIONS = {
  willMount(data) {
    console.log('in埋点', data)
  },
  unMount(data, state) {
    const trackData = createTrackData(state, data)
    console.log('out埋点', trackData)
  },
  inOut(data, state) {
    const trackData = createTrackData(state, data)
    console.log('inOut埋点', trackData)
  },
  mounted(data, state) {
    const trackData = createTrackData(state, data)
    console.log('mounted埋点', trackData)
  }
}

/**
 * 离开组件埋点，记录进入-退出之间的时间
 */
export const TrackPage = params => Target => props => {
  const _name = Target.name

  const willMount = Target.prototype['componentWillMount']
  const didMount = Target.prototype['componentDidMount']
  const willUnmount = Target.prototype['componentWillUnmount']
  
  let begin, end, _end, startTime, endTime, _endTime;
  
  Target.prototype['componentWillMount'] = function (...args) {
    willMount && willMount.apply(this, args)
    begin = Date.now()
    startTime = formateTime(begin)
    
    params['in'] && TRACK_LIFE_ACTIONS['willMount']({
      page: _name,
      startTime,
      ...params['in']['data']
    })
  }

  Target.prototype['componentDidMount'] = async function (...args) {
    didMount && (await didMount.apply(this, args))
    _end = Date.now()
    _endTime = formateTime(_end)
    
    params['mounted'] && TRACK_LIFE_ACTIONS['mounted']({
      page: _name,
      startTime: _endTime,
      loadTime: _end - begin,
      ...params['mounted']['data']
    }, this.state)
  }

  Target.prototype['componentWillUnmount'] = async function (...args) {
    willUnmount && willUnmount.apply(this, args)
    end = Date.now()
    endTime = formateTime(end)
    
    params['out'] && TRACK_LIFE_ACTIONS['unMount']({
      page: _name,
      endTime,
      ...params['out']['data'],
    }, this.state)

    params['inOut'] && TRACK_LIFE_ACTIONS['inOut']({
      page: _name,
      endTime,
      time: end - begin,
      ...params['inOut']['data'],
    }, this.state)

  }
  
  return <Target {...props} />
}

const trackAction = (data, state) => {
  const trackData = createTrackData(state, data)
  console.log('mounted埋点', trackData)
}

/**
 * 方法埋点
 */
export const Track = ({ data, execute = 'after' } = {}) => (target, key, descriptor) => {
  const fn = descriptor.value

  if (typeof fn === 'function') {
    
    descriptor.value = async function(args) {
      if (execute == 'before') {
        console.log('动作开始前进行埋点....')
        trackAction({
          time: formateTime(Date.now()),
          ...data
        }, this.state)
        fn.apply(this, [args])
      } else {
        await fn.apply(this, [args])
        console.log('动作完成后进行埋点....')
        trackAction({
          time: formateTime(Date.now()),
          ...data
        }, this.state)
      }
    }

  }
}

