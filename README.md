# react-decorator-track
> - react埋点中间件
> - 目的:与业务代码完全解耦
> - 支持 组件进入/离开数据埋点（同步/异步）、内部方法埋点（同步/异步）

说明：*第一版本，是为了试验性目的，并不适用所有业务系统，直接提供中间件源码，有需要的可以结合自己的业务，fork源码，进行修改即可*

## Install
npm install react-decorator-track --save

## 使用
`import { TrackPage, Track } from 'react-decorator-track'`

### 组件进入、离开埋点
> - 说明：data 是要使用的埋点数据，包含固定值的数据，和异步请求返回的数据，异步返回的数据需要在state中包含，这样在TrackPage、Track内部才能拿到正确的数据值，将state与data进行结合遍历，替换data中设置为空的值，

```
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
export default class xxxx extends React.Component {
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
    // let data = await statiService.getHomeCount()
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
```
TrackPage 支持 四种模式:（可以选择使用，也支持同时使用）
> - in - componentWillMount,记录进入页面的时间，及自带的数据（data）
> - out - componentWillUnmount，记录离开页面时的时间，及自带的数据（data）
> - inOut - componentWillMount 与 componentWillUnmount，记录进入页面的时间、离开页面时的时间以及页面的停留时间，和自带的数据（data）
> - mounted - componentDidMount，记录挂载(同步/异步初始化数据)进行埋点数据

### TrackPage 说明
> - in: data数据都是固定值，componentWillMount 处理 state 没有意义
> - out - 上面例子中，data包含了 productCount为空，同时它也是state中的属性，这样做的目的是为了，在track将埋点数据productCount替换成state中对应的数据，异步数据问题就可以在内部解决
> - inOut - 同上
> - mounted - 同上

### Track
execute 默认为 after: 用于区分在动作完成前、后进行埋点操作