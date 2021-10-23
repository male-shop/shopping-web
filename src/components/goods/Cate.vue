<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border
                  :show-row-hover="false"
                  class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false"
             style="color: lightgreen;"
             class="el-icon-success"></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        @close="addCateDialogClosed"
        width="50%">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!--
            options：用来指定数据源
            props：用来指定配置对象
          -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
              change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
        title="修改分类"
        :visible.sync="editDialogVisible"
        @close="editDialogClosed"
        width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data () {
      return {
        // 商品分类的数据列表，默认为空
        cateList: [],
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 总数据条数
        total: 0,
        // 为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 标识将当前列定义为模板页
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'isOk'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        // 控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类的表单数据对象
        addCateForm: {
          // 将要添加的分类的名称
          cat_name: '',
          // 父级分类的id
          cat_pid: 0,
          // 分类的等级，默认要添加的是一级分类
          cat_level: 0
        },
        // 添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [
            { required: true, message: '分类名称不能为空', trigger: 'blur' }
          ]
        },
        // 父级分类的列表
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 选中的父级分类的id数组
        selectedKeys: [],
        // 控制编辑分类对话框的显示与隐藏
        editDialogVisible: false,
        // 编辑分类的表单数据对象
        editForm: {
          cat_id: '',
          cat_name: ''
        },
        // 编辑分类表单的验证规则对象
        editFormRules: {
          cat_name: [
            { required: true, message: '分类名称不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 获取商品分类数据
      async getCateList () {
        const { data: res } = await this.$http.get('categories', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取商品分类失败！')
        }
        console.log(res.data)
        // 把数据列表，赋值给cateList
        this.cateList = res.data.result
        // 为总数据条数赋值
        this.total = res.data.total
      },
      // 监听pagesize改变的事件
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 监听pagenum的改变
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 点击按钮，展示添加分类的对话框
      showAddCateDialog () {
        // 先获取父级分类的数据
        this.getParentCateList()
        // 再展示出对话框
        this.addCateDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCateList () {
        const { data: res } = await this.$http.get('categories', {
          params: {
            type: 2
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取父级分类数据失败！')
        }
        console.log(res.data)
        this.parentCateList = res.data
      },
      // 选择项发生变化触发这个函数
      parentCateChanged () {
        console.log(this.selectedKeys)
        // 如果selectedKeys数组中的length大于0，证明选中了父级分类
        // 反之，就说明没有选中任何父级分类
        if (this.selectedKeys.length > 0) {
          // 父级分类的id
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          // 父级分类的id
          this.addCateForm.cat_pid = 0
          // 为当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      // 点击按钮，添加新的分类
      addCate () {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg || '添加分类失败！')
          }
          this.$message.success(res.meta.msg || '添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听对话框的关闭事件，重置表单数据
      addCateDialogClosed () {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 点击按钮，展示编辑分类对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取当前商品分类信息失败')
        }
        this.editForm.cat_id = id
        this.editForm.cat_name = res.data.cat_name
        this.editDialogVisible = true
        console.log(id)
        console.log(res)
        console.log(this.editForm)
      },
      // 编辑分类信息对话框关闭清除信息
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
        this.editForm.cat_id = ''
        this.editForm.cat_name = ''
      },
      // 点击按钮，提交编辑后的分类名称
      editCate () {
        console.log(this.editForm)
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, {
            cat_name: this.editForm.cat_name
          })
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg || '更新分类信息失败')
          }
          console.log(res)
          this.$message.success(res.meta.msg || '更新分类信息成功')
          this.getCateList()
          this.editDialogVisible = false
        })
      },
      // 删除当前分类
      async removeCate (id) {
        const confirmResult = await this.$confirm('确认删除当前分类?', '删除提醒', {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消当前分类删除')
        }
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '当前分类删除失败！')
        }
        this.$message.success(res.meta.msg || '当前分类删除成功！')
        this.getCateList()
      }
    },
    created () {
      this.getCateList()
    }
  }
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
