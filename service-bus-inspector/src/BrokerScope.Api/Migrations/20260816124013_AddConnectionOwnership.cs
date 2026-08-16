using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrokerScope.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConnectionOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Connections",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.Sql(
                """
                IF (SELECT COUNT(*) FROM [AspNetUsers]) = 1
                BEGIN
                    UPDATE [Connections]
                    SET [UserId] = (SELECT TOP(1) [Id] FROM [AspNetUsers])
                    WHERE [UserId] IS NULL;
                END
                """
            );

            migrationBuilder.CreateIndex(
                name: "IX_Connections_UserId_Id",
                table: "Connections",
                columns: new[] { "UserId", "Id" });

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_AspNetUsers_UserId",
                table: "Connections",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_AspNetUsers_UserId",
                table: "Connections");

            migrationBuilder.DropIndex(
                name: "IX_Connections_UserId_Id",
                table: "Connections");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Connections");
        }
    }
}
