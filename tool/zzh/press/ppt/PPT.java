package zzh.press.ppt;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;

import org.nutz.lang.Files;
import org.nutz.lang.Lang;
import org.nutz.lang.Streams;
import org.nutz.lang.Strings;
import org.nutz.lang.segment.Segment;
import org.nutz.lang.segment.Segments;
import org.nutz.lang.util.Context;

/**
 * 需要两个参数
 * 
 * <pre>
 * zpress 源文件(.zpress) 目标目录/文件
 * 
 * 比如
 *   zpress ~/zzh/src/abc.zpress ~/zzh/html/
 *   # 将根据 ~/zzh/src/press.tmpl 输出到 ~/zzh/html/abc.html
 * 
 *   zpress ~/zzh/src/abc.zpress ~/zzh/html/xyz.html
 *   # 将根据 ~/zzh/src/press.tmpl 输出到 ~/zzh/html/xyz.html
 *   # 前提是 xyz.html 必须存在，且是一个文件
 * 
 * </pre>
 * 
 * @author zozoh(zozohtnt@gmail.com)
 */
public class PPT {

	public static void main(String[] args) throws IOException {
		if (args.length != 2) {
			System.err.println("Userage:  zpress [src] [dest]");
			System.exit(0);
		}

		PPTContext pc = new PPTContext();

		// 获取源
		pc.src = Files.findFile(args[0]);
		if (null == pc.src)
			throw Lang.makeThrow("Fail to found source '%s'", args[0]);
		if (!pc.src.isFile())
			throw Lang.makeThrow("'%s' must be a file!", args[0]);

		// 查找库目录
		String libPath = pc.src.getParent() + "/press.tmpl";
		pc.tmplDir = Files.findFile(libPath);
		if (null == pc.tmplDir || !pc.tmplDir.isDirectory()) {
			throw Lang.makeThrow("'%s' no exists", libPath);
		}

		// 分析目标
		pc.dest = Files.findFile(args[1]);
		if (null == pc.dest || pc.dest.isDirectory()) {
			String destPath = args[1] + "/" + Files.getMajorName(pc.src) + ".html";
			pc.dest = Files.createFileIfNoExists(destPath);
		}

		// 解析源
		BufferedReader br = Streams.buffr(Streams.fileInr(pc.src));
		String line;
		int i = 0;

		// 循环每个段，生成对应内容，并加入字符串缓冲
		while ((line = br.readLine()) != null) {
			i++; // 行号递增
			line = Strings.trim(line);
			if (Strings.isBlank(line) || line.startsWith("#"))
				continue;
			/*
			 * 遇到段开始，尝试写到缓冲
			 */
			if (line.startsWith("@")) {
				String effectName = line.substring(1);
				pc.begin(effectName);
				continue;
			}
			// 开始插入变量
			int pos = line.indexOf(':');
			if (pos < 1)
				throw Lang.makeThrow("Wrong var line %d: '%s'", i, line);
			String varName = Strings.trim(line.substring(0, pos));
			String varValue = Strings.trim(line.substring(pos + 1));
			pc.vars.set(varName, varValue);
		}
		// 确保最后一个段插入
		pc.begin(null);

		// 最后插入外模板
		Segment seg = Segments.read(Files.getFile(pc.tmplDir, "main.html"));
		seg.set("main", pc.sb);
		Files.write(pc.dest, seg);

		// 搞定!
		System.out.println("Done!");
	}

	/**
	 * @author zozoh(zozohtnt@gmail.com)
	 */
	public static class PPTContext {

		/**
		 * 转换的源文件
		 */
		private File src;

		/**
		 * 转换的目标文件
		 */
		private File dest;

		/**
		 * 转换需要的模板库目录
		 */
		private File tmplDir;

		/**
		 * 要输出的字符串缓冲
		 */
		private StringBuilder sb = new StringBuilder();

		/**
		 * 段名称
		 */
		private String effectName;

		/**
		 * 变量集
		 */
		private Context vars = Lang.context();

		/**
		 * 将当前段写入缓冲，并开始一个新段
		 */
		public void begin(String enm) {
			// 写入缓冲
			if (null != effectName) {
				Segment seg = Segments.read(Files.getFile(tmplDir, "effect_" + effectName + ".html"));
				sb.append(seg.render(vars)).append("\n");
			}
			// 开始新的段
			if (!Strings.isBlank(enm)) {
				effectName = enm;
				vars = Lang.context();
			}
		}

	}
}
