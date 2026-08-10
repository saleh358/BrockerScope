using BrokerScope.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrokerScope.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260810120000_CreateConnections")]
public sealed class CreateConnections : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Connections",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ConnectionString = table.Column<string>(
                    type: "nvarchar(max)",
                    nullable: false
                ),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Connections", item => item.Id);
            }
        );
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Connections");
    }
}
