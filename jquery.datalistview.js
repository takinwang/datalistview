(function($) {
    var btn_html = '<a href="javascript:void(0)" class="l-btn l-btn-plain l-btn-disabled">'
	    + '<span class="l-btn-left"><span class="l-btn-text"><span class="l-btn-empty $btn_action">&nbsp;</span></span></span>'
	    + '</a>';

    var func = function(options, value) {

	this.methods = {
	    view : this,

	    parseValue : function(o) {
		if (isFunction(o)) {
		    return o.apply(this, []);
		} else {
		    return o;
		}
	    },

	    renderFilter : function(table) {

		var o = this.view.options;
		var tr = $("<tr class='dlv-filter'/>");

		table.append(tr);
		this.filterTR = tr;

		if (o.rowCount != null) {
		    var td = $("<td/>");
		    td.css({
			"width" : o.rowCount.width
		    });
		    var idiv = $("<div class='dlv-cell' style='text-align:center'>"
			    + $.fn.datalistview.defaults.filterText + "</div>");
		    td.append(idiv);
		    tr.append(td);
		}

		for (var i = 0; i < o.columns.length; i++) {
		    var td = $("<td/>");
		    td.css({
			"width" : o.columns[i].width
		    });

		    var idiv = $("<div class='dlv-cell'/>");
		    td.append(idiv);
		    var oid = o.columns[i].id;
		    var filter = o.filterSet[oid];

		    if (filter != null) {
			var tip = $.fn.datalistview.defaults.filterText;
			if (isString(filter.tip)) {
			    tip = filter.tip;
			}

			var defvalue = "";
			if (filter.hasOwnProperty("value")) {
			    defvalue = filter["value"];
			}

			if (filter.type == "text") {
			    var f = function(e) {

				if (e.keyCode == 13) {
				    var oldValue = $(this).attr("oldValue");
				    var value = $(this).val();
				    if (value != oldValue) {
					var data = $.data(this, "data");
					data.object.reload(true);
				    }
				    $(this).attr("oldValue", value);
				}
			    };
			    var input = $("<input title='" + tip + "' value='" + defvalue + "' type='text'/>")
				    .keypress(f).attr("filterName", oid);

			    $.data(input.get(0), "data", {
				object : this
			    });

			    idiv.append(input);
			} else if (filter.type == "list") {
			    var select = $("<select title='" + tip + "'/>").change(function(e) {
				var data = $.data(this, "data");
				data.object.reload(true);
			    }).append($("<option value=''></option>")).attr("filterName", oid);
			    for (var j = 0; j < filter.values.length; j++) {
				var value = filter.values[j];
				var chk = (defvalue === value.value) ? "selected" : "";
				var opt = $("<option " + chk + " value='" + value.value + "'>" + value.title
					+ "</option>");
				select.append(opt);
			    }
			    $.data(select.get(0), "data", {
				object : this
			    });
			    idiv.append(select);
			}
		    }

		    tr.append(td);
		}
	    },

	    // 取消选择
	    deselect : function(keyids) {
		var o = this.view.options;
		if (o.canselect === false)
		    return;

		var data = $.data(this.view.get(0), "data");

		$(data.view).find(".dlv-row.dlv-row-selected").each(function() {
		    var rowdata = $.data($(this).get(0), "data");
		    for ( var idx in keyids) {
			var kid = keyids[idx];
			if (rowdata.value[data.source.keyid] == kid) {
			    $(this).removeClass("dlv-row-selected");

			    for ( var x in data.selected) {
				var tmp = data.selected[x][data.source.keyid];
				if (tmp == kid) {
				    data.selected.splice(x, 1);
				    break;
				}
			    }

			    var $a = $(this).find("input");
			    if ($a.length > 0) {
				$a.get(0).checked = false;
			    }
			}
		    }
		});
		this.updateSelection();
	    },

	    // 选择
	    select : function(all) {
		var o = this.view.options;
		if (o.canselect === false)
		    return;

		var data = $.data(this.view.get(0), "data");

		if (all === true || all === false) {
		    data.selected = [];
		}

		if (this.view.options.multi == true) {
		    $(data.view).find(".dlv-row").each(function() {
			if (all === true) {
			    var rowdata = $.data($(this).get(0), "data");

			    $(this).addClass("dlv-row-selected");
			    data.selected.push(rowdata.value);

			    var $a = $(this).find("input");
			    if ($a.length > 0) {
				$a.get(0).checked = true;
			    }
			} else if (all === false) {
			    $(this).removeClass("dlv-row-selected");
			    var $a = $(this).find("input");
			    if ($a.length > 0) {
				$a.get(0).checked = false;
			    }
			} else {
			    var rowdata = $.data($(this).get(0), "data");
			    for ( var idx in all) {
				var kid = all[idx];
				if (rowdata.value[data.source.keyid] == kid) {
				    $(this).addClass("dlv-row-selected");
				    data.selected.push(rowdata.value);
				    var $a = $(this).find("input");
				    if ($a.length > 0) {
					$a.get(0).checked = true;
				    }
				}
			    }
			}
		    });
		}
		this.updateSelection();
	    },

	    renderHeader : function() {

		var o = this.view.options;
		var headerDiv = $("<div style='width: 100%'/>");
		var tmpdiv = $("<div/>");

		headerDiv.append(tmpdiv);

		if (o.maxHeight > 0) {
		    tmpdiv.css({
			"margin-right" : "16px"
		    });
		}

		var table = $('<table cellpadding="0" cellspacing="0" style="width: 100%"/>');
		if (o.maxHeight > 0) {
		    table.css({
			"table-layout" : "fixed"
		    });
		}

		tmpdiv.append(table);

		if (inArray(o.viewstyles, "list")) {
		    if (isObject(o.filterSet)) {
			var fcc = 0;
			for ( var fs in o.filterSet) {
			    fcc = 1;
			    break;
			}
			if (fcc > 0) {
			    this.renderFilter(table);
			}
		    }
		}

		var tr = $("<tr class='dlv-header'/>");
		table.append(tr);

		if (o.rowCount != null) {
		    var td = $("<td class='dlv-cell'/>");
		    td.css({
			"width" : o.rowCount.width
		    });

		    var idiv = $("<div/>");
		    idiv.css({
			// "width" : "100%", //
			// o.rowCount.width,
			"text-align" : o.rowCount.align
		    });

		    var text = $("<div>" + o.rowCount.title + "</div>");
		    idiv.append(text);

		    if (o.canselect !== false) {
			if (o.multi == true) {
			    var chkbox = $("<input type='checkbox'/>").css({
				"padding" : 0,
				"margin" : 1
			    }).click(function(e) {
				var data = $.data(this, "data");
				data.object.select(this.checked);
			    });
			    $.data(chkbox.get(0), "data", {
				"object" : this
			    });
			    text.prepend(chkbox);
			}
		    }

		    td.append(idiv);
		    tr.append(td);
		}

		for (var i = 0; i < o.columns.length; i++) {
		    var td = $("<td class='dlv-cell'/>");
		    var column = o.columns[i];

		    if (!isNotEmpty(column.headHover)) {
			column.headHover = false;
		    }

		    if (column.headHover == true) {
			td.mouseover(function(e) {

			    $(this).addClass("dlv-header-over");
			}).mouseout(function(e) {

			    $(this).removeClass("dlv-header-over");
			});
		    }

		    if (!isNotEmpty(column.sortAble)) {
			column.sortAble = false;
		    }
		    if (!isNotEmpty(column.align)) {
			column.align = "left";
		    }

		    $.data(td.get(0), "data", {
			index : i,
			object : this
		    });

		    var idiv = $("<div />");
		    idiv.css({
			"text-align" : column.align
		    });

		    if (isNotEmpty(column.width)) {
			idiv.css({
			// "width" : "100%", // column.width
			});
			td.css({
			    "width" : column.width
			});
		    }

		    var text = $("<div>" + column.title + "</div>");
		    var span = $("<span><span class='dlv-sort-icon'></span></span>");

		    if (!isNotEmpty(this.sortSpan)) {
			this.sortSpan = [];
		    }
		    this.sortSpan.push(span);

		    text.append(span);
		    idiv.append(text);

		    td.append(idiv);

		    if (o.columns[i].sortAble) {
			var f = function(e) {

			    var data = $.data(this, "data");
			    var o = data.object.view.options;
			    var column = o.columns[data.index];
			    var tmpSet = [];

			    var slen = o.sortSet.length;
			    if (isNotEmpty(o.multiSort) && o.multiSort == false) {
				if (slen > 0) {
				    if (column.id != o.sortSet[0].id) {
					slen = 0;
				    }
				}
				slen = slen > 1 ? 1 : slen;
				//
				for (var aidx = 0; aidx < data.object.sortSpan.length; aidx++) {
				    data.object.sortSpan[aidx].removeClass('dlv-sort-asc').removeClass('dlv-sort-desc');
				}
			    }

			    var sort = "";
			    var csort = null;
			    for (var idx = 0; idx < slen; idx++) {
				sort = o.sortSet[idx].sort;
				if (column.id == o.sortSet[idx].id) {
				    if (sort == "asc") {
					sort = "desc";
				    } else if (sort == "desc") {
					sort = "";
				    } else {
					sort = "asc";
				    }
				    csort = sort;
				}
				if (sort != "") {
				    tmpSet.push({
					id : o.sortSet[idx].id,
					sort : sort
				    });
				}
			    }
			    if (csort == null) {
				csort = "asc";
				tmpSet.push({
				    id : column.id,
				    sort : csort
				});
			    }
			    o.sortSet = tmpSet;

			    var span = $($(this).find("div span").get(0)).removeClass('dlv-sort-asc').removeClass(
				    'dlv-sort-desc');
			    if (csort != "") {
				span.addClass('dlv-sort-' + csort);
			    }
			    column.sort = sort;

			    data.object.reload();
			};
			td.click(f).css({
			    cursor : "pointer"
			});

			var slen = o.sortSet.length;
			if (isNotEmpty(o.multiSort) && o.multiSort == false) {
			    slen = slen > 1 ? 1 : slen;
			}

			for (var idx = 0; idx < slen; idx++) {
			    if (o.columns[i].id == o.sortSet[idx].id) {
				$(text.find("span").get(0)).addClass('dlv-sort-' + o.sortSet[idx].sort);
				break;
			    }
			}
		    }

		    tr.append(td);
		}

		return headerDiv;
	    },

	    renderPager : function() {
		var o = this.view.options;

		if (isNotEmpty(o.pagination.pageDiv)) {
		    this.view.pageDiv = this.renderTopPageDiv(1);
		    // if (isString(o.pagination.pageDiv)) {
		    $(o.pagination.pageDiv).addClass("pageContainer").append(this.view.pageDiv);
		    // } else {
		    // this.view.append(this.view.pageDiv);
		    // }
		}

		if (isNotEmpty(o.pagination.pageDiv1)) {
		    // if (isString(o.pagination.pageDiv1))
		    // {
		    this.view.pageDiv1 = this.renderTopPageDiv(2);
		    $(o.pagination.pageDiv1).addClass("pageContainer").append(this.view.pageDiv1);
		    // }
		}

		if (isNotEmpty(o.pagination.pageInfo)) {

		    var mydiv = $("<div/>");
		    this.view.infoDiv = $('<span/>');

		    mydiv.append(this.view.infoDiv);

		    if (o.viewstyles.length == 2) {
			var f = function(e) {
			    if ($(this).hasClass("l-btn-disabled"))
				return;
			    var data = $.data(this, "data");
			    data.object.toggleViewStyle("list");
			};
			var page_list = $(btn_html.replace("$btn_action", "icon-list")).click(f);
			this.btn_list = [ page_list ];
			if (o.viewstyle == "tile") {
			    page_list.removeClass("l-btn-disabled");
			}
			$.data(page_list.get(0), "data", {
			    "object" : this
			});
			var f = function(e) {
			    if ($(this).hasClass("l-btn-disabled"))
				return;
			    var data = $.data(this, "data");
			    data.object.toggleViewStyle("tile");
			};
			var page_tile = $(btn_html.replace("$btn_action", "icon-tile")).click(f);
			this.btn_tile = [ page_tile ];
			if (o.viewstyle == "list") {
			    page_tile.removeClass("l-btn-disabled");
			}
			$.data(page_tile.get(0), "data", {
			    "object" : this
			});

			mydiv.append(page_list);
			mydiv.append(page_tile);
		    }

		    if (isString(o.pagination.pageInfo)) {
			$(o.pagination.pageInfo).append(mydiv);
		    } else {
			this.view.infoDiv.css({
			    "float" : "right"
			}); // .addClass(pagination - info);
			this.view.pageDiv.append(mydiv);
		    }
		}

		if (isNotEmpty(o.pagination.pageInfo1)) {
		    if (isString(o.pagination.pageInfo1)) {
			var mydiv = $("<div/>");
			this.view.infoDiv1 = $('<span/>');

			mydiv.append(this.view.infoDiv1);
			if (o.viewstyles.length == 2) {
			    var f = function(e) {
				if ($(this).hasClass("l-btn-disabled"))
				    return;
				var data = $.data(this, "data");
				data.object.toggleViewStyle("list");
			    };
			    var page_list = $(btn_html.replace("$btn_action", "icon-list")).click(f);
			    this.btn_list.push(page_list);
			    if (o.viewstyle == "view") {
				page_list.removeClass("l-btn-disabled");
			    }
			    $.data(page_list.get(0), "data", {
				"object" : this
			    });
			    var f = function(e) {
				if ($(this).hasClass("l-btn-disabled"))
				    return;
				var data = $.data(this, "data");
				data.object.toggleViewStyle("tile");
			    };
			    var page_tile = $(btn_html.replace("$btn_action", "icon-tile")).click(f);
			    this.btn_tile.push(page_tile);
			    if (o.viewstyle == "list") {
				page_tile.removeClass("l-btn-disabled");
			    }
			    $.data(page_tile.get(0), "data", {
				"object" : this
			    });

			    mydiv.append(page_list);
			    mydiv.append(page_tile);
			}
			$(o.pagination.pageInfo1).append(mydiv);
		    }
		}
	    },

	    toggleViewStyle : function(vs) {
		var o = this.view.options;
		if (vs == "tile") {
		    for (var i = 0; i < this.btn_list.length; i++) {
			this.btn_list[i].removeClass("l-btn-disabled");
		    }
		    for (var i = 0; i < this.btn_tile.length; i++) {
			this.btn_tile[i].addClass("l-btn-disabled");
		    }
		    if (isNotEmpty(this.list_bodyDiv))
			this.list_bodyDiv.hide();
		    if (isNotEmpty(this.tile_bodyDiv))
			this.tile_bodyDiv.show();
		} else {
		    for (var i = 0; i < this.btn_list.length; i++) {
			this.btn_list[i].addClass("l-btn-disabled");
		    }
		    for (var i = 0; i < this.btn_tile.length; i++) {
			this.btn_tile[i].removeClass("l-btn-disabled");
		    }
		    if (isNotEmpty(this.list_bodyDiv))
			this.tile_bodyDiv.hide();
		    if (isNotEmpty(this.list_bodyDiv))
			this.list_bodyDiv.show();
		}
	    },

	    renderListBody : function() {

		var o = this.view.options;
		var div = $("<div class='dlv-wrap'/>");
		if (o.maxHeight > 0) {
		    div.css({
			"max-height" : o.maxHeight,
			"overflow-y" : "scroll"
		    });
		} else {
		    div.css({
			"overflow-y" : "hidden"
		    });
		}
		if (o.minHeight > 0) {
		    div.css({
			"min-height" : o.minHeight
		    });
		}

		this.bodyTable = $('<table class="dlv-body" cellpadding="0" cellspacing="0" style="width:100%"/>');
		if (o.maxHeight > 0) {
		    this.bodyTable.css({
			"table-layout" : "fixed"
		    });
		}

		this.skipRows = 0;
		if (isNotEmpty(o.header) && false == o.header) {
		} else {
		    var header = this.renderHeader();
		    if (o.maxHeight > 0) {
			this.view.append(header);
		    } else {
			var headerRows = header.find("tr");
			this.skipRows = headerRows.length;
			this.bodyTable.append(headerRows);
		    }
		}

		div.append(this.bodyTable);

		return div;
	    },

	    renderTileBody : function() {
		var o = this.view.options;
		var div = $("<div />");

		if (o.minHeight > 0) {
		    div.css({
			"min-height" : o.minHeight
		    });
		}
		return div;
	    },

	    render : function() {

		var o = this.view.options;

		this.view.addClass("dlv");

		if (inArray(o.viewstyles, "list")) {
		    var bodyDiv = this.renderListBody();
		    if (o.viewstyle == "tile") {
			bodyDiv.hide();
		    }
		    this.list_bodyDiv = bodyDiv;
		    this.view.append(bodyDiv);
		}
		if (inArray(o.viewstyles, "tile")) {
		    var bodyDiv = this.renderTileBody();
		    if (o.viewstyle == "list") {
			bodyDiv.hide();
		    }
		    this.tile_bodyDiv = bodyDiv;
		    this.view.append(bodyDiv);
		}

		this.renderPager();
	    },

	    clearBody : function() {
		var o = this.view.options;
		if (inArray(o.viewstyles, "list")) {
		    if (this.skipRows == 0) {
			this.bodyTable.find("tr").remove();
		    } else {
			this.bodyTable.find("tr:gt(" + (this.skipRows - 1) + ")").remove();
		    }
		}
		if (inArray(o.viewstyles, "tile")) {
		    this.tile_bodyDiv.empty();
		}
	    },

	    onSelectPage : function(pagination) {

		this.load(pagination.pageNumber, pagination.pageSize);
	    },

	    updatePage : function(option) {
		debugger;

		var o = this.view.options;
		var tocallback = true;
		if (isNotEmpty(option.pageSize)) {
		    if ($.inArray(option.pageSize, o.pagination.pageList) != -1) {
			o.pagination.pageSize = option.pageSize;

			for (var j = 0; j < 2; j++) {
			    if (isNotEmpty(o.pagination.object["pageList"][j])) {
				o.pagination.object["pageList"][j].val(option.pageSize);
			    }
			}
		    }
		}
		if (isNotEmpty(option.totalSize)) {
		    tocallback = false;
		    o.pagination.totalSize = option.totalSize;
		}

		o.pagination.lastPage = o.pagination.totalSize % o.pagination.pageSize;

		var totalPage = (o.pagination.totalSize - o.pagination.lastPage) / o.pagination.pageSize;

		o.pagination.totalPage = totalPage + (o.pagination.lastPage == 0 ? 0 : 1);

		o.pagination.totalPage = o.pagination.totalPage == 0 ? 1 : o.pagination.totalPage;

		if (isNotEmpty(option.pageNumber)) {
		    o.pagination.pageNumber = option.pageNumber;
		}

		if (o.pagination.pageNumber < 1)
		    o.pagination.pageNumber = 1;
		
		if (o.pagination.pageNumber > o.pagination.totalPage)
		    o.pagination.pageNumber = o.pagination.totalPage;

		for (var j = 0; j < 2; j++) {

		    if (o.pagination.pageNumber == 1) {
			if (isNotEmpty(o.pagination.object["page_first"][j]))
			    o.pagination.object["page_first"][j].addClass("l-btn-disabled");
			if (isNotEmpty(o.pagination.object["page_prev"][j]))
			    o.pagination.object["page_prev"][j].addClass("l-btn-disabled");
		    } else {
			if (isNotEmpty(o.pagination.object["page_first"][j]))
			    o.pagination.object["page_first"][j].removeClass("l-btn-disabled");
			if (isNotEmpty(o.pagination.object["page_prev"][j]))
			    o.pagination.object["page_prev"][j].removeClass("l-btn-disabled");
		    }

		    if (o.pagination.pageNumber == o.pagination.totalPage) {
			if (isNotEmpty(o.pagination.object["page_next"][j]))
			    o.pagination.object["page_next"][j].addClass("l-btn-disabled");
			if (isNotEmpty(o.pagination.object["page_last"][j]))
			    o.pagination.object["page_last"][j].addClass("l-btn-disabled");
		    } else {
			if (isNotEmpty(o.pagination.object["page_next"][j]))
			    o.pagination.object["page_next"][j].removeClass("l-btn-disabled");
			if (isNotEmpty(o.pagination.object["page_last"][j]))
			    o.pagination.object["page_last"][j].removeClass("l-btn-disabled");
		    }
		    if (isNotEmpty(o.pagination.object["totalPage"][j]))
			o.pagination.object["totalPage"][j].html($.fn.datalistview.defaults.totalPage.replace(
				"{totalPage}", o.pagination.totalPage));
		    if (isNotEmpty(o.pagination.object["pageNo"][j]))
			o.pagination.object["pageNo"][j].val(o.pagination.pageNumber);

		}

		if (tocallback == true) {
		    this.onSelectPage(o.pagination);
		}
		// this.updateSelection();
	    },

	    renderTopPageDiv : function(nidx) {

		var o = this.view.options;
		var div = $("<div class='pagination dlv-pager'/>");

		var table = $('<table cellspacing="0" cellpadding="0" border="0"/>');
		var tr = $("<tr/>");
		table.append(tr);

		if (isNotEmpty(o.pagination.object)) {

		} else {
		    o.pagination.object = {};
		}

		var td;
		td = $("<td>");

		var pageList = [ 10, 20, 30, 50 ];
		if (isNotEmpty(o.pagination.pageList)) {
		    pageList = o.pagination.pageList;
		}
		o.pagination.pageList = pageList;
		var f = function(e) {
		    var data = $.data(this, "data");
		    data.object.updatePage({
			pageSize : parseInt($(this).val())
		    });
		};
		var select = $("<select class='pagination-page-list'/>").change(f);
		$.data(select.get(0), "data", {
		    "object" : this
		});

		for (var i = 0; i < pageList.length; i++) {
		    select.append($("<option value='" + pageList[i] + "'>" + pageList[i] + "</option>"));
		}
		var pageSize = 20;
		if (isNotEmpty(o.pagination.pageSize)) {
		    pageSize = o.pagination.pageSize;
		}
		o.pagination.pageSize = pageSize;
		select.val(pageSize);

		if (pageList.length <= 1) {
		    td.hide();
		}

		td.append(select);
		tr.append(td);

		var btn_sep = "<td><div class='pagination-btn-separator'/></td>";
		var sep = $(btn_sep);
		if (sep.length <= 1) {
		    sep.hide();
		}

		tr.append(sep);

		if (isNotEmpty(o.pagination.object["pageList"])) {
		    o.pagination.object["pageList"].push(select);
		} else {
		    o.pagination.object["pageList"] = [ select ];
		}

		td = $("<td/>"); // l-btn-disabled
		var f = function(e) {

		    if ($(this).hasClass("l-btn-disabled"))
			return;
		    var data = $.data(this, "data");
		    data.object.updatePage({
			pageNumber : 1
		    });
		};
		var page_first = $(btn_html.replace("$btn_action", "pagination-first")).click(f);
		td.append(page_first);
		tr.append(td);
		$.data(page_first.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["page_first"])) {
		    o.pagination.object["page_first"].push(page_first);
		} else {
		    o.pagination.object["page_first"] = [ page_first ];
		}

		td = $("<td/>"); // l-btn-disabled
		var f = function(e) {

		    if ($(this).hasClass("l-btn-disabled"))
			return;
		    var data = $.data(this, "data");
		    var pageNumber = o.pagination.pageNumber - 1;
		    data.object.updatePage({
			pageNumber : pageNumber > 0 ? pageNumber : 1
		    });
		};
		var page_prev = $(btn_html.replace("$btn_action", "pagination-prev")).click(f);
		td.append(page_prev);
		tr.append(td);
		$.data(page_prev.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["page_prev"])) {
		    o.pagination.object["page_prev"].push(page_prev);
		} else {
		    o.pagination.object["page_prev"] = [ page_prev ];
		}

		tr.append(btn_sep);

		tr
			.append('<td><span style="padding-left:6px;">' + $.fn.datalistview.defaults.pagePrev
				+ '</span></td>');

		td = $("<td/>"); //
		var f = function(e) {

		    if (e.keyCode == 13) {
			var oldValue = $(this).attr("oldValue");
			var value = parseInt($(this).val());
			if (value >= 0 && value != oldValue) {
			    var data = $.data(this, "data");
			    data.object.updatePage({
				pageNumber : value
			    });
			}
			$(this).attr("oldValue", value);
		    }
		};
		var pageNo = $('<input type="text" size="3" value="1" class="pagination-num">').keypress(f);
		td.append(pageNo);
		tr.append(td);
		$.data(pageNo.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["pageNo"])) {
		    o.pagination.object["pageNo"].push(pageNo);
		} else {
		    o.pagination.object["pageNo"] = [ pageNo ];
		}

		td = $("<td/>"); //
		var totalPage = $("<span style='padding-right:6px;'/>");
		totalPage.html($.fn.datalistview.defaults.totalPage.replace("{totalPage}", 1));
		td.append(totalPage);
		tr.append(td);

		if (isNotEmpty(o.pagination.object["totalPage"])) {
		    o.pagination.object["totalPage"].push(totalPage);
		} else {
		    o.pagination.object["totalPage"] = [ totalPage ];
		}

		tr.append(btn_sep);

		td = $("<td/>"); // l-btn-disabled
		var f = function(e) {

		    if ($(this).hasClass("l-btn-disabled"))
			return;
		    var data = $.data(this, "data");
		    var pageNumber = o.pagination.pageNumber + 1;
		    data.object.updatePage({
			pageNumber : pageNumber > o.pagination.totalPage ? o.pagination.totalPage : pageNumber
		    });
		};
		var page_next = $(btn_html.replace("$btn_action", "pagination-next")).click(f);

		td.append(page_next);
		tr.append(td);
		$.data(page_next.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["page_next"])) {
		    o.pagination.object["page_next"].push(page_next);
		} else {
		    o.pagination.object["page_next"] = [ page_next ];
		}

		td = $("<td/>"); // l-btn-disabled
		var page_last = $(btn_html.replace("$btn_action", "pagination-last")).click(function(e) {

		    if ($(this).hasClass("l-btn-disabled"))
			return;
		    var data = $.data(this, "data");
		    data.object.updatePage({
			pageNumber : o.pagination.totalPage
		    });
		});
		td.append(page_last);
		tr.append(td);
		$.data(page_last.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["page_last"])) {
		    o.pagination.object["page_last"].push(page_last);
		} else {
		    o.pagination.object["page_last"] = [ page_last ];
		}

		tr.append(btn_sep);

		td = $("<td/>"); // l-btn-disabled
		var page_load = $(btn_html.replace("$btn_action", "pagination-load")).click(function(e) {

		    if ($(this).hasClass("l-btn-disabled"))
			return;

		    var data = $.data(this, "data");
		    data.object.clean_cache();
		    data.object.reload(true);
		});
		td.append(page_load);
		tr.append(td);
		$.data(page_load.get(0), "data", {
		    "object" : this
		});

		if (isNotEmpty(o.pagination.object["page_load"])) {
		    o.pagination.object["page_load"].push(page_load);
		} else {
		    o.pagination.object["page_load"] = [ page_load ];
		}

		if (isObject(o.pagination.buttons)) {
		    var items_count = o.pagination.buttons.length;
		    if (items_count > 0) {
			tr.append(btn_sep);
			for (var ai = 0; ai < items_count; ai++) {
			    var but = o.pagination.buttons[ai]; // { }

			    td = $("<td/>"); // l-btn-disabled
			    var link = $("<a href='javascript:void(0);' class='l-btn l-btn-plain'>" + but.text + "</a>")
				    .click(function(e) {

					e.stopPropagation();
					var but = $.data(this, "data");
					but.handler.apply(this, []);
				    });

			    $.data(link.get(0), "data", but);

			    if (isNotEmpty(but.title)) {
				link.attr("title", but.title);
			    }

			    if (isNotEmpty(but.iconCls)) {
				link.attr("iconCls", but.iconCls);
			    }

			    td.append(link);
			    tr.append(td);
			}
		    }
		}

		div.append(table);

		this.updatePage({
		    totalSize : 0
		});

		return div;
	    },

	    getPagination : function() {

		var o = this.view.options;
		return o.pagination;
	    },

	    getSource : function() {
		var data = $.data(this.view.get(0), "data");
		return data.source;
	    },

	    selected : function() {
		var data = $.data(this.view.get(0), "data");
		return data.selected;
	    },

	    update : function(key, val) {
		var o = this.view.options;
		o[key] = val;
	    },

	    /**
	     * 如果设置了缓存，则清空缓存，重新加载整个列表
	     */
	    clean_cache : function() {
		var o = this.view.options;
		o.pagination.clean_cache = 1;
	    },

	    /**
	     * 从第一页开始加载
	     */
	    reset_offset : function() {
		var o = this.view.options;
		o.pagination.pageNumber = 1;
	    },

	    reload : function(reset_totalsize) {
		var o = this.view.options;

		var data = $.data(this.view.get(0), "data");
		data.selected = [];
		this.updateSelection();

		if (reset_totalsize === true) {
		    o.pagination.totalSize = 0;
		    o.pagination.totalPage = 0;
		}

		// if (typeof (manual) != "undefined") {
		// o.pagination.pageNumber = pageNumber;
		// }

		this.load(o.pagination.pageNumber, o.pagination.pageSize);
	    },

	    loading : function(loading) {

		var o = this.view.options;
		var loadbt = function(loading) {

		    for (var j = 0; j < 2; j++) {
			var obj = o.pagination.object["page_load"][j];
			if (isNotEmpty(obj)) {
			    if (loading) {
				obj.addClass("l-btn-disabled");
				obj.find("span>span>span").removeClass("pagination-load")
					.addClass("pagination-loading");
			    } else {
				obj.removeClass("l-btn-disabled");
				obj.find("span>span>span").removeClass("pagination-loading")
					.addClass("pagination-load");
			    }
			}
		    }
		};

		loadbt(loading);

		if (loading) {
		    $(document.body).css({
			"cursor" : "wait"
		    });

		    if (isNotEmpty(this.loadingDiv)) {
			this.loadingDiv.remove();
		    }

		    if (o.progress === false) {

		    } else {
			var r = getViewportInfo();
			var div = $("<div class='waiting_wrap'/>");
			div.css({
			    'z-index' : 9903,
			    'left' : (r.w - 80) / 2,
			    'top' : (r.h - 50) / 2
			});

			var table = "<table cellpadding='0' cellspacing='0' style='width:100%;vertical-align:top'><tr>";
			table += "<td style='width: 39px'><div class='waiting'/></td>";

			table += "<td style='padding: 2px;padding-left: 4px'><span style='font-size: 12px;'>"
				+ $.fn.datalistview.defaults.infoLoading + "</span></td>";
			table += "</tr></table>";
			div.html(table);

			$(document.body).append(div);
			this.loadingDiv = div;
		    }
		} else {
		    $(document.body).css({
			"cursor" : "default"
		    });
		    if (isNotEmpty(this.loadingDiv)) {
			this.loadingDiv.remove();
		    }
		    this.loadingDiv = null;
		}
	    },

	    load : function(pageNumber, pageSize) {

		var o = this.view.options;

		var filterSet = [];
		if (isNotEmpty(this.filterTR)) {
		    this.filterTR.find("input").each(function(i, o) {

			var filterName = $(this).attr("filterName");
			var filterValue = $(this).val();
			if (filterValue != "") {
			    filterSet.push({
				id : filterName,
				value : filterValue
			    });
			}
		    });
		    this.filterTR.find("select").each(function(i, o) {

			var filterName = $(this).attr("filterName");
			var filterValue = $(this).val();

			if (filterValue != "") {
			    filterSet.push({
				id : filterName,
				value : filterValue
			    });
			}
		    });
		}

		this.loading(true);

		if (isFunction(o.source)) {
		    var qry = {
			offset : (pageNumber - 1) * pageSize,
			pageSize : pageSize,
			totalPage : o.pagination.totalPage,
			totalSize : o.pagination.totalSize,
			sortSet : o.sortSet,
			filterSet : filterSet,
			clean_cache : o.pagination.clean_cache
		    };
		    if (o.useHash) {
			this.updateHash(qry);
		    }

		    var source = o.source.apply(this, [ qry ]);

		    if (source != null) {
			this.setSource(source);
		    }
		} else if (isObject(o.source)) {
		    this.setSource(o.source);
		}
	    },

	    updateHash : function(qry) {
		if (isNotEmpty($.toJSON)) {
		    var srt = [];
		    for (var i = 0; i < qry.sortSet.length; i++) {
			srt.push([ qry.sortSet[i].id, qry.sortSet[i].sort == "desc" ? 0 : 1 ]);
		    }
		    var flt = [];
		    for (var i = 0; i < qry.filterSet.length; i++) {
			flt.push([ qry.filterSet[i].id, qry.filterSet[i].value ]);
		    }

		    var qval = [ 88, [ qry.offset, qry.pageSize, qry.totalPage, qry.totalSize ], srt, flt, 99 ];
		    // window.console.info($.toJSON(qval));
		    setHashKey("dlv", base64encode(utf16to8($.toJSON(qval))));
		}
	    },

	    updateSelection : function() {
		var o = this.view.options;

		var vdata = $.data(this.view.get(0), "data");
		var selected = vdata.selected;

		// if (selected.length > 0)
		this.onSelected(selected);

		var str = $.fn.datalistview.defaults.infoMsg;
		if (o.canselect !== false) {
		    str += $.fn.datalistview.defaults.infoSel.replace("{selected}", selected.length);
		}

		var from = (o.pagination.pageNumber - 1) * o.pagination.pageSize + 1;
		var to = o.pagination.pageNumber * o.pagination.pageSize;
		to = to > o.pagination.totalSize ? o.pagination.totalSize : to;

		var tstr = str.replace("{from}", from).replace("{to}", to).replace("{total}", o.pagination.totalSize);

		if (isNotEmpty(this.view.infoDiv)) {
		    this.view.infoDiv.html(tstr);
		}
		if (isNotEmpty(this.view.infoDiv1)) {
		    if (isString(o.pagination.pageDiv1)) {
			this.view.infoDiv1.html(tstr);
		    }
		}
	    },

	    drawListview : function(source) {
		var o = this.view.options;
		if (!isNotEmpty(this.bodyTable)) {
		    return;
		}

		var table = this.bodyTable;
		var selected = data.selected;

		if (source.data.length == 0) {
		    var colspan = 1;
		    var cols = table.find("tr:eq(0)").children();
		    if (cols.length > 0) {
			colspan = cols.length;
		    }

		    var tr = $("<tr class='dlv-row' style='height: 60px'/>");
		    var td = $("<td colspan=\"" + colspan + "\" class='dlv-cell' style='text-align:center'/>");
		    td.html($.fn.datalistview.defaults.infoEmptySource);

		    tr.append(td);
		    table.append(tr);

		} else {

		    for (var i = 0; i < source.data.length; i++) {
			var f = function(e) {

			    var data = $.data(this, "data");

			    var o = data.object.view.options;
			    if (o.canselect === false)
				return;

			    var vdata = $.data(data.object.view.get(0), "data");

			    var selected = vdata.selected;

			    var cdata = data.value[vdata.source.keyid];
			    if (isNotEmpty(cdata.value)) {
				cdata = cdata.value;
			    }
			    var uid = cdata;

			    if (data.object.view.options.multi == true) {
				$(this).toggleClass("dlv-row-selected");
				selected = $.grep(selected, function(n, i) {
				    var cdata = n[vdata.source.keyid];
				    if (isNotEmpty(cdata.value)) {
					cdata = cdata.value;
				    }
				    return cdata != uid;
				});
				var tg_chk = function(that, val) {
				    var t = $(that).find("input");
				    if (t.length > 0)
					t.get(0).checked = val;
				};

				if ($(this).hasClass("dlv-row-selected")) {
				    selected.push(data.value);
				    tg_chk(this, true);
				} else {
				    tg_chk(this, false);
				}
			    } else {
				$(vdata.view).find(".dlv-row-selected").removeClass("dlv-row-selected");
				$(this).toggleClass("dlv-row-selected");

				if ($(this).hasClass("dlv-row-selected")) {
				    selected = [ data.value ];
				} else {
				    selected = [];
				}
			    }

			    vdata.selected = selected;
			    data.object.updateSelection();
			};
			var tr = $("<tr class='dlv-row'/>").addClass("dlv-row-" + (i % 2)).mouseover(function(e) {
			    $(this).addClass("dlv-row-over");
			}).mouseout(function(e) {
			    $(this).removeClass("dlv-row-over");
			}).dblclick(function(e) {
			    var data = $.data(this, "data");
			    data.object.onRowDblClick([ data.value ]);
			}).click(f);

			if (isNotEmpty(o.rowHeight)) {
			    tr.css({
				"height" : o.rowHeight
			    });
			}

			var td;
			if (o.rowCount != null) {
			    td = $("<td class='dlv-cell'/>").css({
				"width" : o.rowCount.width,
				"text-align" : o.rowCount.align
			    });

			    if (isNotEmpty(o.rowCount.valign)) {
				td.css({
				    "vertical-align" : o.rowCount.valign
				});
			    }

			    var idiv = $("<div/>");
			    idiv.css({
				"width" : "100%", // o.rowCount.width,
				"text-align" : o.rowCount.align
			    });
			    td.append(idiv);

			    var startid = (o.pagination.pageNumber - 1) * o.pagination.pageSize;
			    startid = startid < 0 ? 0 : startid;
			    idiv.html("<span>" + (startid + i + 1) + "</span>");

			    tr.append(td);

			    if (o.canselect !== false) {
				if (o.multi == true) {
				    var chkbox = $("<input type='checkbox'/>").css({
					"padding" : 0,
					"margin" : 1
				    });
				    idiv.prepend(chkbox);
				}
			    }
			}

			var adata = source.data[i];
			// if (o.multi == true) {
			var cdata = adata[source.keyid];
			if (isNotEmpty(cdata.value)) {
			    cdata = cdata.value;
			}

			if (o.canselect !== false) {
			    var exists = false;
			    for (var idx = 0; idx < selected.length; idx++) {
				var bdata = selected[idx][source.keyid];
				if (isNotEmpty(bdata.value)) {
				    bdata = bdata.value;
				}
				if (bdata == cdata) {
				    exists = true;
				    break;
				}
			    }

			    if (exists == true) {
				if (o.multi == true) { // multi

				    // select
				    if (tr.find("input").length > 0) {
					tr.find("input").get(0).checked = true;
				    }
				}
				tr.addClass("dlv-row-selected");
			    }
			}
			// }

			for (var j = 0; j < o.columns.length; j++) {
			    var td = $("<td class='dlv-cell'/>");
			    if (isNotEmpty(o.columns[j].valign)) {
				td.css({
				    "vertical-align" : o.columns[j].valign
				});
			    }

			    var idiv = $("<div />");
			    idiv.css({
				"text-align" : o.columns[j].align
			    });
			    td.append(idiv);

			    if (isNotEmpty(o.columns[j].width)) {
				idiv.css({
				    "width" : "100%"// ,
				// o.columns[j].width
				});
				td.css({
				    "width" : o.columns[j].width
				});
			    }

			    var column = o.columns[j];
			    if (isNotEmpty(adata[column.id])) {
				var cdata = adata[column.id];

				var text = "";
				if (isNotEmpty(column.formatter)) {
				    var func = column.formatter;

				    if (!isFunction(func)) {
					try {
					    func = eval(func);
					} catch (e) {
					    func = null;
					}
				    }

				    if (isNotEmpty(func)) {
					text = func.apply(this, [ i, source, column ]);
				    }

				    if (isString(text)) {
					idiv.html(text);
				    } else {
					idiv.append(text);
				    }

				} else {
				    text = cdata;
				    if (isNotEmpty(cdata.value)) {
					text = cdata.value;
				    }
				    idiv.html(text);
				}
			    }
			    tr.append(td);
			}
			table.append(tr);

			$.data(tr.get(0), "data", {
			    index : i,
			    value : source.data[i],
			    object : this
			});

			if (isFunction(this.contextmenu)) {
			    tr.bind('contextmenu', function(e) {

				e.preventDefault();
				e.stopPropagation();

				var data = $.data(this, "data");
				e.data = data;
				data.object.contextmenu.apply(this, [ e ]);
			    });
			}

			this.onAddRow(table, tr, source.data[i]);
		    }
		}
	    },

	    drawTileview : function(source) {
		var o = this.view.options;

		var tileBody = $("<div class='tileBody'/>");
		if (source.data.length == 0) {

		    var table = $("<table style='width:100%' />");

		    var tr = $("<tr class='dlv-row' style='height: 60px'/>");
		    var td = $("<td class='dlv-cell' style='text-align:center'/>");
		    td.html($.fn.datalistview.defaults.infoEmptySource);

		    tr.append(td);
		    table.append(tr);

		    tileBody.append(table);
		} else {
		    var ul = $("<ul class='dlv_body'/>");
		    for (var i = 0; i < source.data.length; i++) {

			var adata = source.data[i];
			var cdata = adata[source.keyid];
			if (isNotEmpty(cdata.value)) {
			    cdata = cdata.value;
			}

			var f = function(e) {

			    var data = $.data(this, "data");
			    var vdata = $.data(data.object.view.get(0), "data");
			    var o = data.object.view.options;

			    if (o.canselect === false)
				return;

			    var selected = vdata.selected;

			    var cdata = data.value[vdata.source.keyid];
			    if (isNotEmpty(cdata.value)) {
				cdata = cdata.value;
			    }
			    var uid = cdata;

			    if (data.object.view.options.multi == true) {
				$(this).toggleClass("dlv-row-selected");
				selected = $.grep(selected, function(n, i) {
				    var cdata = n[vdata.source.keyid];
				    if (isNotEmpty(cdata.value)) {
					cdata = cdata.value;
				    }
				    return cdata != uid;
				});
				if ($(this).hasClass("dlv-row-selected")) {
				    selected.push(data.value);
				    $(this).find("input").get(0).checked = true;
				} else {
				    $(this).find("input").get(0).checked = false;
				}
			    } else {
				$(vdata.view).find(".dlv-row-selected").removeClass("dlv-row-selected");
				$(this).toggleClass("dlv-row-selected");
				if ($(this).hasClass("dlv-row-selected")) {
				    selected = [ data.value ];
				} else {
				    selected = [];
				}
			    }

			    vdata.selected = selected;
			    data.object.updateSelection();

			};

			var li = $("<li/>");
			var idiv = $("<div class='thumb'/>").mouseover(function(e) {
			    $(this).addClass("dlv-row-over");
			}).mouseout(function(e) {
			    $(this).removeClass("dlv-row-over");
			}).dblclick(function(e) {
			    var data = $.data(this, "data");
			    data.object.onRowDblClick([ data.value ]);
			}).click(f);

			if (isNotEmpty(o.tiles)) {
			    if (isNotEmpty(o.tiles.width)) {
				idiv.css({
				    "width" : o.tiles.width
				});
			    }
			    if (isNotEmpty(o.tiles.height)) {
				idiv.css({
				    "height" : o.tiles.height
				});
			    }
			}

			if (isFunction(this.contextmenu)) {
			    idiv.bind('contextmenu', function(e) {

				e.preventDefault();
				e.stopPropagation();

				var data = $.data(this, "data");
				e.data = data;
				data.object.contextmenu.apply(this, [ e ]);
			    });
			}

			if (isNotEmpty(o.formatter)) {
			    var func = o.formatter;

			    if (!isFunction(func)) {
				try {
				    func = eval(func);
				} catch (e) {
				    func = null;
				}
			    }

			    if (isNotEmpty(func)) {
				text = func.apply(this, [ i, source ]);
			    }

			    if (isString(text)) {
				idiv.html(text);
			    } else {
				idiv.append(text);
			    }

			} else {
			    text = cdata;
			    if (isNotEmpty(cdata.value)) {
				text = cdata.value;
			    }
			    idiv.html(text);
			}

			li.append(idiv);

			$.data(idiv.get(0), "data", {
			    index : i,
			    value : source.data[i],
			    object : this
			});
			ul.append(li);
		    }

		    tileBody.append(ul);
		}
		this.tile_bodyDiv.append(tileBody);
	    },

	    setSource : function(source) {
		var o = this.view.options;
		this.clearBody();

		if (isObject(source.data)) {
		    var data = $.data(this.view.get(0), "data");
		    data["source"] = source;

		    this.updatePage({
			totalSize : source.total
		    });
		} else {
		    alert("数据格式错误！");
		}

		if (inArray(o.viewstyles, "list")) {
		    this.drawListview(source);
		}
		if (inArray(o.viewstyles, "tile")) {
		    this.drawTileview(source);
		}

		this.updateSelection();

		this.loading(false);
	    },

	    onSelected : function(selected) {
	    },

	    onRowDblClick : function(selection) {
	    },

	    onAddRow : function(table, tr, data) {
		var o = this.view.options;

		if (isFunction(o.onDetailInfo)) {
		    var f = function(e) {

			e.stopPropagation();
			var data = $.data(this, "data");

			if ($(this).hasClass("icon-add") == true) {
			    if (isNotEmpty(data.view.options.foldInfo)) {
				if (data.view.options.foldInfo == true) {

				    var info_tr = $.data(data.view.get(0), "info_tr");
				    for (var k = 0; k < info_tr.length; k++) {
					info_tr[k][0].removeClass("icon-remove").addClass("icon-add");
					info_tr[k][1].hide();
				    }
				}
			    }

			    data.tr.show();
			    $(this).removeClass("icon-add").addClass("icon-remove");

			} else {
			    data.tr.hide();
			    $(this).removeClass("icon-remove").addClass("icon-add");
			}

			data.view.options.onDetailInfo.apply(data.panel, [ data.data,
				data.panel.attr("opened") == "true" ]);

			data.panel.attr("opened", "true");

		    };
		    var icoDiv = $("<div class='icon-add'/>").css({
			"width" : 16,
			"height" : 16
		    }).click(f);

		    var div = $("<div class='detail_info_btn'/>")
			    .attr("title", $.fn.datalistview.defaults.toggleDetail).append(icoDiv);

		    tr.find("td:eq(0)").prepend(div);

		    var ctd = tr.find("td").length;

		    var newtr = $("<tr class='detail_info_tr' style='display:none'/>");
		    var newtd = $("<td colspan='" + ctd + "'/>");
		    var newdiv = $("<div class='detail_info_panel'/>");

		    // newdiv.text("1234");

		    newtd.append(newdiv);
		    newtr.append(newtd);

		    table.append(newtr);

		    var info_tr = $.data(this.view.get(0), "info_tr");
		    if (!isNotEmpty(info_tr)) {
			info_tr = [];
		    }
		    info_tr.push([ icoDiv, newtr ]);
		    $.data(this.view.get(0), "info_tr", info_tr);

		    $.data(icoDiv.get(0), "data", {
			"panel" : newdiv,
			"tr" : newtr,
			"view" : this.view,
			"data" : data
		    });
		}

		if (isFunction(o.onAddRow)) {
		    // debugger;
		    o.onAddRow.apply(table, tr, data);
		}
	    }
	};

	if (isString(options)) {
	    var data = $.data(this.get(0), "data");

	    data.view.refresh = false;
	    if (options == "reload") {
		if (value === true) {
		    data.view.refresh = true;
		}
		value = null;
	    }

	    if (isFunction(data.view.methods[options])) {
		var f = data.view.methods[options];
		if (isNotEmpty(value)) {
		    return f.apply(data.view.methods, value);
		} else {
		    return f.apply(data.view.methods);
		}
	    }
	    return null;
	}

	this.options = $.extend({
	    multi : false,
	    canselect : true,
	    useHash : true,
	    header : true,

	    viewstyles : [ "list" ],
	    viewstyle : "list",

	    pagination : {},
	    maxHeight : 0,
	    minHeight : 0,

	    scrollWidth : 14,

	    source : {},
	    sortSet : [],

	    methods : {},

	    rowCount : {
		width : $.fn.datalistview.defaults.w_rowCount ,
		align : "center",
		title : $.fn.datalistview.defaults.rowTitle
	    },
	    onDetailInfo : null
	}, options);

	if (this.options.useHash == true) {
	    var hval = getHashKey("dlv");
	    if (hval != "") {
		try {
		    eval("var qry =" + utf8to16(base64decode(hval)));
		    if (qry[0] === 88 && qry[qry.length - 1] === 99) {
			var pst = qry[1];
			var srt = qry[2];
			var flt = qry[3];

			var sortSet = [];
			for (var i = 0; i < srt.length; i++) {
			    sortSet.push({
				"id" : srt[i][0],
				"sort" : srt[i][1] == 0 ? "desc" : "asc"
			    });
			}
			this.options["sortSet"] = sortSet;

			var filterSet = this.options["filterSet"];
			for (var i = 0; i < flt.length; i++) {
			    var iid = flt[i][0];
			    if (filterSet.hasOwnProperty(iid)) {
				filterSet[iid]["value"] = flt[i][1];
			    }
			}
			this.options["filterSet"] = filterSet;
		    }
		} catch (e) {
		}
	    }
	}

	this.methods = $.extend(this.methods, this.options.methods);
	this.methods.options = this.options;
	this.methods.render();

	var data = $.data(this.get(0), "data", {
	    "selected" : [],
	    "view" : this
	});

	this.methods.reload();
    };

    var opt = {
	datalistview : func
    };

    $.extend($.fn, opt);

    $.fn.datalistview.defaults = {
	w_rowCount : 60,
	filterText : "筛选",
	toggleDetail : "展开详细",
	rowTitle : "编号",
	pagePrev : "第",
	totalPage : "共 {totalPage} 页",
	infoMsg : '显示第 {from} 到 {to} 条，共 {total} 条记录',
	infoSel : '，已选择 {selected} 条',
	infoLoading : '数据加载中，请稍候...',
	infoEmptySource : '没有记录！'
    };

})(jQuery);
