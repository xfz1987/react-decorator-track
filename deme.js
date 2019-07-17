import React from 'react'
import { Link } from 'react-router-dom'
import PageTitle from 'component/page-title/index.jsx'
import statiService from 'service/statistic.js'
import './index.scss'
// import { TrackPage, Track } from 'util/decorator.js'
import { TrackPage, Track } from 'react-decorator-track'

@TrackPage({
  in: {
    data: { evt: 'in', test: '1' }
  },
  out: {
    data: { evt: 'out', test: '2', productCount: '' }
  },
  inOut: {
    data: { evt: 'in-out', test: '3', productCount: '' }
  },
  mounted: {
    data: { evt: 'mount', test: '5', userCount: '', orderCount: '' }
  }
})
export default class Home extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      userCount: '-',
      productCount: '-',
      orderCount: '-'
    }
  }

  componentWillMount() {
    // console.log('will')
  }
  
  getHomeCount() {
    const data = {
      userCount: '666',
      productCount: '333',
      orderCount: '999'
    }

    return new Promise(resolve => setTimeout(() => resolve(data), 1000))
  }

  async componentDidMount() {
    let data = await this.getHomeCount()
    this.setState(data)
  }
  
  
  @Track({
    data: {  evt: 'func1', test: 'a', userCount: '' },
    // execute: 'before'
  })
  async submit() {
    console.log('提交')
    const data = await new Promise(resolve => setTimeout(() => resolve('555'), 1000))
    this.setState({ userCount: data })
  }

  componentWillUnmount() {
    console.log('准备离开') 
  }

  render() {
    let { userCount, productCount, orderCount } = this.state
    return (
      <div className="page-wrapper">
        <PageTitle title="首页" />
        <div className="row">
          <div className="col-md-4">
            <Link to="/user" className="color-box brown">
              <p className="count">{userCount}</p>
              <p className="desc">
                <i className="fa fa-user-o"></i>
                <span>用户总数</span>
              </p>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/product" className="color-box green">
              <p className="count">{productCount}</p>
              <p className="desc">
                <i className="fa fa-user-o"></i>
                <span>商品总数</span>
              </p>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/order" className="color-box blue">
              <p className="count">{orderCount}</p>
              <p className="desc">
                <i className="fa fa-user-o"></i>
                <span>订单总数</span>
              </p>
            </Link>
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => this.submit()}>提交测试</button>
        </div>
      </div>
    )
  }
}