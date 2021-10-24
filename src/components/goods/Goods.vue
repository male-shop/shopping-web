<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       @click="removeById(scope.row.goods_id)"
                       size="mini" ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑商品区域 -->
    <el-dialog
        title="修改商品信息"
        :visible.sync="editGoodDialogVisible"
        @close="editGoodDialogClosed"
        width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGood">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Goods',
    data () {
      return {
        // 查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        // 总数据条数
        total: 0,
        // 商品列表
        goodsList: [],
        // 控制编辑商品信息对话框的显示与隐藏
        editGoodDialogVisible: false,
        // 编辑商品的表单信息对象
        editForm: {
          goods_id: '',
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0
        },
        // 编辑商品表单的验证规则对象
        editFormRules: {
          goods_name: [
            { required: true, message: '商品名称不能为空', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '商品价格不能为空', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '商品数量不能为空', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '商品重量不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 获取所有商品列表
      async getGoodsList () {
        const { data: res } = await this.$http.get('goods', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取商品信息列表失败')
        }
        this.total = res.data.total
        this.goodsList = res.data.goods
        console.log(res.data)
      },
      // 修改当前pagesize
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      // 修改当前pagenum
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      // 根据id删除当前商品
      async removeById (id) {
        const confirmResult = await this.$confirm('是否确认删除该商品', '商品删除', {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除当前商品')
        }
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '商品删除失败！')
        }
        this.$message.success('商品删除成功')
        this.getGoodsList()
      },
      // 通过路由导航跳转到添加商品组件
      goAddPage () {
        this.$router.push('/goods/add')
      },
      // 点击按钮，展示编辑对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('goods/' + id)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取商品信息失败')
        }
        this.editForm = res.data
        this.editGoodDialogVisible = true
      },
      // 编辑商品对话框关闭重置操作
      editGoodDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      // 提交修改后的商品信息
      editGood () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg || '修改商品信息失败！')
          }
          console.log(res)
          this.$message.success('修改商品信息成功！')
          this.editGoodDialogVisible = false
          this.getGoodsList()
        })
      }
    },
    created () {
      // 获取所有商品列表
      this.getGoodsList()
    }
  }
</script>

<style lang="less" scoped>

</style>
