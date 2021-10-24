<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getOrderList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox(scope.row.order_id)"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        @close="addressDialogClosed"
        width="50%">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData"
                       :props="{ expandTrigger: 'hover' }"
                       v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrderAddress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
        title="提示"
        :visible.sync="progressDialogVisible"
        width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityData from './js/citydata'
  export default {
    name: 'Order',
    data () {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        total: 0,
        orderList: [],
        // 控制修改地址对话框的显示与隐藏
        addressDialogVisible: false,
        // 修改地址表单的数据对象
        addressForm: {
          address1: [],
          address2: ''
        },
        // 修改地址表单的验证规则对象
        addressFormRules: {
          address1: [
            { required: true, message: '省市区/县不能为空', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '详细地址不能为空', trigger: 'blur' }
          ]
        },
        cityData,
        // 控制物流进度对话框的显示与隐藏
        progressDialogVisible: false,
        // 物流信息
        progressInfo: []
      }
    },
    methods: {
      // 获取订单列表
      async getOrderList () {
        const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取订单列表失败')
        }
        this.total = res.data.total
        this.orderList = res.data.goods
        console.log(res)
      },
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      // 展示修改地址的对话框
      async showBox (id) {
        const { data: res } = await this.$http.get('orders/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取订单信息失败！')
        }
        this.addressForm.address2 = res.data.consignee_addr
        console.log(res)
        this.addressDialogVisible = true
      },
      // 地址对话框关闭之后的重置操作
      addressDialogClosed () {
        this.$refs.addressFormRef.resetFields()
      },
      // 修改订单地址
      editOrderAddress () {
        this.addressDialogVisible = false
      },
      async showProgressBox () {
        const { data: res } = await this.$http.get('kuaidi/1106975712662')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取物流信息失败')
        }
        console.log(res)
        this.progressInfo = res.data
        this.progressDialogVisible = true
      }
    },
    created () {
      this.getOrderList()
    }
  }
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>
